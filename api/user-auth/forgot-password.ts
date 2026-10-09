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
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return sendResponse(res, 400, { success: false, error: 'Please enter a valid email address.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const users = loadUsers();
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return sendResponse(res, 200, {
        success: true,
        message: 'If an account exists with this email address, a password reset link has been dispatched.',
      });
    }

    const token = crypto.randomBytes(24).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
    saveUsers(users.map((u) => (u.id === user.id ? user : u)));

    return sendResponse(res, 200, {
      success: true,
      message: 'Password reset link dispatched. Please check your inbox and spam folders.',
      resetToken: process.env.NODE_ENV !== 'production' ? token : undefined,
    });
  } catch (err: any) {
    return sendResponse(res, 500, { success: false, error: err?.message || 'Server error requesting password reset.' });
  }
}
