import { NextResponse } from 'next/server';

import { verifyJwt, updateSession } from './libs/auth/session';

export async function middleware(request) {
  const token = request.cookies.get('session')?.value;
  const res = NextResponse.next();

  if (!token) {
    return res;
  }

  try {
    // 1. 기존 토큰 decode
    const payload = await verifyJwt(token);

    // 2. 토큰 잔여기간이 15일 미만인 경우 재발급
    const expiresAt = payload.exp * 1000; // 타임스탬프
    const THRESHOLD = 1000 * 60 * 60 * 24 * 15; // 15일
    if (expiresAt - Date.now() < THRESHOLD) {
      await updateSession(res.cookies);

      console.log(
        '[middleware] session refreshed:',
        payload?.userId || '[unknown]',
      );
    }
  } catch (err) {
    console.error('[middleware] invalid session, clearing:', err);
    res.cookies.delete('session');
  }

  return res;
}

export const config = {
  matcher: ['/hr/:path*', '/notices/:path*'],
};
