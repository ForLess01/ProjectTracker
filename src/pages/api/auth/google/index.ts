import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ redirect, url }) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/google/callback`;

  if (!clientId) {
    return new Response(
      JSON.stringify({ error: 'Google OAuth no está configurado en las variables de entorno (GOOGLE_CLIENT_ID missing).' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  return redirect(googleAuthUrl.toString(), 302);
};
