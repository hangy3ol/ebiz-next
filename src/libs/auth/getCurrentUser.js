import { cookies } from 'next/headers';

import { verifyJwt } from '@/libs/auth/session';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;

  try {
    const payload = await verifyJwt(token);
    return payload;
  } catch {
    return null;
  }
}
