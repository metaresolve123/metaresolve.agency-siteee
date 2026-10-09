import { createPasswordResetToken } from '../../serverStorage';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    const result = createPasswordResetToken(email.trim().toLowerCase());
    if (!result.success) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email address, a password reset link has been dispatched.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset link dispatched. Please check your inbox and spam folders.',
      resetToken: process.env.NODE_ENV !== 'production' ? result.token : undefined,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error requesting password reset' });
  }
}
