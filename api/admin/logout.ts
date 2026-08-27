import { serverlessSessions } from '../_auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  let token = '';
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.body && req.body.token) {
    token = String(req.body.token).trim();
  }

  if (token) {
    serverlessSessions.delete(token);
  }

  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
}
