import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const encoder = new TextEncoder();
const secret = encoder.encode(process.env.SESSION_SECRET);

// JWT 토큰 생성
export async function signJWT(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

// JWT 토큰 검증 및 payload 반환
export async function verifyJwt(token) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

// 세션 쿠키 생성
export async function createSession(payload) {
  const token = await signJWT(payload);

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    // secure: true,
    maxAge: 60 * 60 * 24 * 30, // 30일
    path: '/',
  });
}

// 세션 쿠키 갱신
export async function updateSession(externalCookies = null) {
  const cookieStore = externalCookies || (await cookies());
  const token = cookieStore.get('session')?.value;

  // 토큰이 없으면 종료
  if (!token) {
    return null;
  }

  try {
    const payload = await jwtVerify(token, secret);
    const { exp, iat, ...data } = payload;

    const newToken = await signJWT(data);

    cookieStore.set('session', newToken, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30일
    });

    return true;
  } catch (err) {
    console.error('[updateSession] 실패:', err);
    return null;
  }
}

// 세션 쿠키 삭제
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
