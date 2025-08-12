import { NextResponse } from 'next/server';

import { signJWT, verifyJwt } from '@/libs/auth/session';

export async function middleware(request) {
  const token = request.cookies.get('session')?.value;

  // 1. 토큰 없음 → 로그인 페이지로 리다이렉트
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const response = NextResponse.next();

  try {
    // 2. 토큰 유효성 검증
    const payload = await verifyJwt(token);

    // 3. 토큰 만료까지 15일 미만 → 자동 재발급
    const expiresAt = payload.exp * 1000;
    const THRESHOLD = 1000 * 60 * 60 * 24 * 15; // 15일
    const remaining = expiresAt - Date.now();

    if (remaining > THRESHOLD) {
      const { exp, iat, ...data } = payload;
      const newToken = await signJWT(data);

      response.cookies.set('session', newToken, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30일
      });
      console.log('[middleware] session refreshed:', payload?.userId);
    }

    return response;
  } catch (err) {
    // 유효하지 않은 토큰 → 삭제 후 로그인으로 리다이렉트
    console.error('[middleware] invalid session, redirecting:', err);

    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete('session');
    return res;
  }
}

export const config = {
  matcher: ['/hr/:path*', '/notices/:path*'], // 인증 필요 경로 설정
};
