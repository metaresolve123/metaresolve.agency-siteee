import { createUserRecord, createSession, sanitizeUser } from '../../serverStorage';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { name, email, password, confirmPassword, agreeTerms, rememberMe } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }
    if (agreeTerms === false) {
      return res.status(400).json({ success: false, error: 'You must agree to the Terms of Service & Privacy Policy.' });
    }

    const { user, error } = createUserRecord({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      authProvider: 'local',
    });

    if (error || !user) {
      return res.status(400).json({ success: false, error: error || 'Failed to create account.' });
    }

    const session = createSession(user.id, rememberMe !== false);
    return res.status(200).json({
      success: true,
      message: 'Account created successfully!',
      token: session.token,
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error during signup' });
  }
}
