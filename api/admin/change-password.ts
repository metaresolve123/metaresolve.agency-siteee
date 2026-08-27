import { authenticateServerlessRequest, getAdminPassword, safeCompare } from '../_auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const session = authenticateServerlessRequest(req);
  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Valid admin session required.'
    });
  }

  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || String(newPassword).trim().length < 6) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 6 characters long.'
    });
  }

  const expectedPassword = getAdminPassword();
  const providedCurrent = String(currentPassword).trim();

  if (!expectedPassword || !safeCompare(providedCurrent, expectedPassword)) {
    return res.status(401).json({
      success: false,
      error: 'Current password does not match.'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'To change the admin password permanently, update the ADMIN_PASSWORD environment variable in your Vercel project settings.'
  });
}
