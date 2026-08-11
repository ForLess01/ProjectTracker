import type { APIRoute } from 'astro';
import { destroySession } from '../../../lib/auth';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const sessionId = cookies.get('app_session')?.value;
  if (sessionId) {
    await destroySession(sessionId);
    cookies.delete('app_session', { path: '/' });
  }
  return redirect('/login');
};
