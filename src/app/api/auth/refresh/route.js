import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { verifyJwt, signJWT } from '@/libs/auth/session';

export async function POST() {
  const cookieStore = cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const payload = await verifyJwt(token);
    const now = Date.now();
    const exp = payload.exp * 1000;

    const remaining = exp - now;
    const THRESHOLD = 1000 * 60 * 60 * 24 * 15; // 15일

    if (remaining > THRESHOLD) {
      return NextResponse.json({ success: false, message: '갱신 불필요' });
    }

    const { iat, exp: _, ...user } = payload;
    const newToken = await signJWT(user);

    cookieStore.set('session', newToken, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30일
    });

    console.log('[refresh] session updated:', user?.userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    cookieStore.delete('session');
    console.error('[refresh] invalid session:', err);
    return NextResponse.json({ success: false }, { status: 401 });
  }
}
