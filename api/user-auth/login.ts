/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import {
  loadUsers,
  saveUsers,
  sanitize,
  signSessionToken,
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
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return sendResponse(res, 400, { success: false, error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const users = loadUsers();
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return sendResponse(res, 401, { success: false, error: 'No account found with this email address.' });
    }

    if (user.authProvider === 'google' && !user.passwordHash) {
      return sendResponse(res, 401, {
        success: false,
        error: 'This account was created with Google. Please use Continue with Google.',
      });
    }

    if (!user.passwordHash || !user.salt) {
      return sendResponse(res, 401, { success: false, error: 'Password authentication not set up for this account.' });
    }

    const calculatedHash = crypto.scryptSync(password, user.salt, 64).toString('hex');
    const expectedBuffer = Buffer.from(user.passwordHash, 'hex');
    const calculatedBuffer = Buffer.from(calculatedHash, 'hex');

    if (expectedBuffer.length !== calculatedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, calculatedBuffer)) {
      return sendResponse(res, 401, { success: false, error: 'Invalid password. Please check your credentials.' });
    }

    user.lastLoginAt = new Date().toISOString();
    saveUsers(users.map((u) => (u.id === user.id ? user : u)));

    const sanitized = sanitize(user);
    const token = signSessionToken(sanitized, rememberMe !== false);

    return sendResponse(res, 200, {
      success: true,
      message: 'Welcome back!',
      token,
      user: sanitized,
    });
  } catch (err: any) {
    return sendResponse(res, 500, { success: false, error: err?.message || 'Server error during login.' });
  }
}
