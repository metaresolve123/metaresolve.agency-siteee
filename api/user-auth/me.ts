import { getUserFromSession, sanitizeUser } from '../../serverStorage';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    let token = '';
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.query?.token) {
      token = String(req.query.token).trim();
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'No authentication token provided.' });
    }

    const user = getUserFromSession(token);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid.' });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error checking session' });
  }
}
