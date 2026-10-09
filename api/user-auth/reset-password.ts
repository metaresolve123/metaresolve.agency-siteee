/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import {
  loadUsers,
  saveUsers,
  parseRequestBody,
  sendResponse,
} from '../_userAuth.ts';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return sendResponse(res, 405, { success: false, error: 'Method not allowed' });
  }

  try {
    const body = parseRequestBody(req);
    const { token, newPassword, confirmPassword } = body;

    if (!token || typeof token !== 'string') {
      return sendResponse(res, 400, { success: false, error: 'Reset token is required.' });
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return sendResponse(res, 400, { success: false, error: 'New password must be at least 6 characters long.' });
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      return sendResponse(res, 400, { success: false, error: 'Passwords do not match.' });
    }

    const users = loadUsers();
    const now = Date.now();
    const user = users.find((u) => u.resetToken === token && u.resetTokenExpiry && u.resetTokenExpiry > now);

    if (!user) {
      return sendResponse(res, 400, {
        success: false,
        error: 'Invalid or expired password reset link. Please request a new one.',
      });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.scryptSync(newPassword, salt, 64).toString('hex');

    user.passwordHash = passwordHash;
    user.salt = salt;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    saveUsers(users);

    return sendResponse(res, 200, {
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new credentials.',
    });
  } catch (err: any) {
    return sendResponse(res, 500, { success: false, error: err?.message || 'Server error resetting password.' });
  }
}
