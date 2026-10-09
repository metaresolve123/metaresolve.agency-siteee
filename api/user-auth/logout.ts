import { destroySession } from '../../serverStorage';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    let token = '';
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.body?.token) {
      token = String(req.body.token).trim();
    }

    if (token) {
      destroySession(token);
    }

    return res.status(200).json({ success: true, message: 'Signed out successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error during logout' });
  }
}
