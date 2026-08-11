import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { users } from '../../../../db/schema';
import { createSession } from '../../../../lib/auth';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return redirect('/login?error=google_access_denied');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return redirect('/login?error=google_config_missing');
  }

  try {
    // 1. Exchange auth code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Google Token Error:', tokenData);
      return redirect('/login?error=google_token_failed');
    }

    // 2. Fetch User Profile from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userRes.json();
    if (!userRes.ok || !googleUser.email) {
      return redirect('/login?error=google_user_failed');
    }

    const { id: googleId, email, name, picture } = googleUser;

    // 3. Find or Create User in DB
    let [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

    if (!user) {
      // Create new Google user
      [user] = await db.insert(users).values({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId,
        avatarUrl: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=3f88c5&color=fff`,
      }).returning();
    } else if (!user.googleId) {
      // Link Google ID to existing user email
      [user] = await db.update(users)
        .set({ googleId, avatarUrl: picture || user.avatarUrl })
        .where(eq(users.id, user.id))
        .returning();
    }

    // 4. Create Session & Set Cookie
    const sessionId = await createSession(user.id);

    cookies.set('app_session', sessionId, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return redirect('/app');
  } catch (err) {
    console.error('Google OAuth Callback Exception:', err);
    return redirect('/login?error=google_server_error');
  }
};
