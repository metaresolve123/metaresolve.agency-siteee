import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const host = req.headers?.host || 'metaresolve.com';
  const protocol = req.headers?.['x-forwarded-proto'] || 'https';
  const appUrl = (process.env.APP_URL || `${protocol}://${host}`).replace(/\/$/, '');
  const redirectUri = `${appUrl}/api/user-auth/google/callback`;

  if (!clientId) {
    return res.status(200).json({
      success: false,
      configured: false,
      error: 'Google OAuth Client ID is not configured in environment variables. Please add GOOGLE_CLIENT_ID in your configuration.',
    });
  }

  const state = crypto.randomBytes(16).toString('hex');
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(clientId)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('openid email profile')}&` +
    `state=${encodeURIComponent(state)}&` +
    `access_type=offline&` +
    `prompt=select_account`;

  return res.status(200).json({
    success: true,
    configured: true,
    url: authUrl,
    clientId,
  });
}
