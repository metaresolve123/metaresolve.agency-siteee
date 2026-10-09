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
import type { StoredUser } from '../_userAuth.ts';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return sendResponse(res, 405, { success: false, error: 'Method not allowed' });
  }

  try {
    const body = parseRequestBody(req);
    const { name, email, password, confirmPassword, agreeTerms, rememberMe } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return sendResponse(res, 400, { success: false, error: 'Full name is required.' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return sendResponse(res, 400, { success: false, error: 'A valid email address is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return sendResponse(res, 400, { success: false, error: 'Password must be at least 6 characters long.' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return sendResponse(res, 400, { success: false, error: 'Passwords do not match.' });
    }
    if (agreeTerms === false) {
      return sendResponse(res, 400, { success: false, error: 'You must agree to the Terms of Service & Privacy Policy.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const users = loadUsers();
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (existing) {
      return sendResponse(res, 400, { success: false, error: 'An account already exists with this email address.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');

    const newUser: StoredUser = {
      id: `USR-${Math.floor(100000 + Math.random() * 900000)}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      salt,
      authProvider: 'local',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const sanitized = sanitize(newUser);
    const token = signSessionToken(sanitized, rememberMe !== false);

    return sendResponse(res, 200, {
      success: true,
      message: 'Account created successfully!',
      token,
      user: sanitized,
    });
  } catch (err: any) {
    return sendResponse(res, 500, { success: false, error: err?.message || 'Server error during registration.' });
  }
}
