import { findUserByEmail, createUserRecord, createSession, saveAllUsers, getAllUsers } from '../../../serverStorage';

export default async function handler(req: any, res: any) {
  const { code, error } = req.query;

  if (error) {
    console.error('Google OAuth callback returned error:', error);
    return res.redirect(`/?auth_error=${encodeURIComponent(String(error))}`);
  }

  if (!code || typeof code !== 'string') {
    return res.redirect(`/?auth_error=${encodeURIComponent('Missing authorization code from Google')}`);
  }

  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const host = req.headers?.host || 'metaresolve.com';
  const protocol = req.headers?.['x-forwarded-proto'] || 'https';
  const appUrl = (process.env.APP_URL || `${protocol}://${host}`).replace(/\/$/, '');
  const redirectUri = `${appUrl}/api/user-auth/google/callback`;

  if (!clientId || !clientSecret) {
    return res.redirect(`/?auth_error=${encodeURIComponent('Google OAuth Client credentials not configured on server')}`);
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
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

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Google token exchange failed:', tokenData);
      return res.redirect(`/?auth_error=${encodeURIComponent(tokenData.error_description || 'Failed to exchange token with Google')}`);
    }

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileResponse.json();
    if (!profileResponse.ok || !profile.email) {
      return res.redirect(`/?auth_error=${encodeURIComponent('Failed to retrieve user profile from Google')}`);
    }

    let user = findUserByEmail(profile.email);
    if (!user) {
      const created = createUserRecord({
        name: profile.name || profile.email.split('@')[0],
        email: profile.email,
        authProvider: 'google',
        googleId: profile.sub,
        avatarUrl: profile.picture,
      });
      user = created.user;
    } else {
      if (!user.googleId) user.googleId = profile.sub;
      if (profile.picture && !user.avatarUrl) user.avatarUrl = profile.picture;
      saveAllUsers(getAllUsers().map((u) => (u.id === user!.id ? user! : u)));
    }

    const session = createSession(user.id, true);
    return res.redirect(`/?auth_token=${encodeURIComponent(session.token)}&auth_name=${encodeURIComponent(user.name)}`);
  } catch (err: any) {
    console.error('Error handling Google OAuth callback:', err);
    return res.redirect(`/?auth_error=${encodeURIComponent(err?.message || 'Server error during Google authentication')}`);
  }
}
