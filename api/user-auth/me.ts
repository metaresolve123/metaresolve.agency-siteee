/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  getBearerToken,
  verifySessionToken,
  loadUsers,
  sanitize,
  sendResponse,
} from '../_userAuth.ts';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return sendResponse(res, 405, { success: false, error: 'Method not allowed' });
  }

  try {
    const token = getBearerToken(req);

    if (!token) {
      return sendResponse(res, 401, { success: false, error: 'No authentication token provided.' });
    }

    // Try HMAC verification first (stateless, works across all lambda instances)
    const verified = verifySessionToken(token);
    if (verified) {
      return sendResponse(res, 200, {
        success: true,
        user: verified,
      });
    }

    // Fallback: check stored users if token was legacy hex ID
    const users = loadUsers();
    const user = users.find((u) => u.id === token || u.email === token);
    if (user) {
      return sendResponse(res, 200, {
        success: true,
        user: sanitize(user),
      });
    }

    return sendResponse(res, 401, { success: false, error: 'Session expired or invalid.' });
  } catch (err: any) {
    return sendResponse(res, 500, { success: false, error: err?.message || 'Server error checking session.' });
  }
}
