import { defineMiddleware } from 'astro:middleware';
import { validateSession } from './lib/auth';

export const onRequest = defineMiddleware(async ({ cookies, url, redirect, locals }, next) => {
  const sessionId = cookies.get('app_session')?.value;
  const userSession = await validateSession(sessionId);

  if (userSession) {
    locals.user = userSession.user;
    locals.session = userSession.session;
  } else {
    locals.user = null;
    locals.session = null;
  }

  // Protect /app routes
  if (url.pathname.startsWith('/app')) {
    if (!locals.user) {
      return redirect('/login');
    }
  }

  return next();
});
