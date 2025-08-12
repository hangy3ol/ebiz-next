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

// 세션 쿠키 삭제
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
