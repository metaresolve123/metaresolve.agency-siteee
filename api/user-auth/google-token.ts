/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
    const { credential } = body;
    if (!credential || typeof credential !== 'string') {
      return sendResponse(res, 400, { success: false, error: 'Google credential token is required' });
    }

    const parts = credential.split('.');
    if (parts.length !== 3) {
      return sendResponse(res, 400, { success: false, error: 'Malformed Google credential token' });
    }

    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);

    if (!payload.email) {
      return sendResponse(res, 400, { success: false, error: 'Invalid Google token: email missing' });
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const users = loadUsers();
    let user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      user = {
        id: `USR-${Math.floor(100000 + Math.random() * 900000)}`,
        name: payload.name || payload.email.split('@')[0],
        email: normalizedEmail,
        authProvider: 'google',
        googleId: payload.sub,
        avatarUrl: payload.picture,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      users.push(user);
    } else {
      if (!user.googleId) user.googleId = payload.sub;
      if (payload.picture && !user.avatarUrl) user.avatarUrl = payload.picture;
      user.lastLoginAt = new Date().toISOString();
    }

    saveUsers(users);

    const sanitized = sanitize(user);
    const token = signSessionToken(sanitized, true);

    return sendResponse(res, 200, {
      success: true,
      token,
      user: sanitized,
    });
  } catch (err: any) {
    return sendResponse(res, 500, { success: false, error: err?.message || 'Failed to verify Google token' });
  }
}
