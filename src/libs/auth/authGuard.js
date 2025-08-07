import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { verifyJwt } from '@/libs/auth/session';

export async function authGuard() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;

  if (!session) {
    redirect('/login');
  }

  try {
    const payload = await verifyJwt(session);
    const { iat, exp, ...currentUser } = payload;

    return currentUser;
  } catch (err) {
    console.error('[requireAuth] invalid session:', err);
    redirect('/login');
  }
}
