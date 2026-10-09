/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getBearerToken, sendResponse } from '../_userAuth.ts';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return sendResponse(res, 405, { success: false, error: 'Method not allowed' });
  }

  try {
    getBearerToken(req);
    return sendResponse(res, 200, { success: true, message: 'Signed out successfully.' });
  } catch (err: any) {
    return sendResponse(res, 500, { success: false, error: err?.message || 'Server error during logout' });
  }
}
