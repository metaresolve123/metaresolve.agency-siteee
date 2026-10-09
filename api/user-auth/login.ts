import { authenticateUser, createSession, sanitizeUser } from '../../serverStorage';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password, rememberMe } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const { user, error } = authenticateUser(email.trim().toLowerCase(), password);
    if (error || !user) {
      return res.status(401).json({ success: false, error: error || 'Invalid email or password.' });
    }

    const session = createSession(user.id, rememberMe !== false);
    return res.status(200).json({
      success: true,
      message: 'Welcome back!',
      token: session.token,
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error during login' });
  }
}
