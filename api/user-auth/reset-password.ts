import { resetPasswordWithToken } from '../../serverStorage';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { token, newPassword, confirmPassword } = req.body || {};

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, error: 'Reset token is required.' });
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    const result = resetPasswordWithToken(token.trim(), newPassword);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error || 'Failed to reset password.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new credentials.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error resetting password' });
  }
}
