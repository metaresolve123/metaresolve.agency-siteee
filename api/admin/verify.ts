import { authenticateServerlessRequest } from '../_auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const session = authenticateServerlessRequest(req);
  if (!session) {
    return res.status(401).json({
      success: false,
      valid: false,
      error: 'Session is invalid or expired.'
    });
  }

  return res.status(200).json({
    success: true,
    valid: true,
    username: session.username,
    expiresAt: session.expiresAt
  });
}
