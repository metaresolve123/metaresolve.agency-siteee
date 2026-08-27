import crypto from 'crypto';
import { getAdminUsername, getAdminPassword, safeCompare, serverlessSessions, AdminSession } from '../_auth';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Both username and password are required.'
    });
  }

  const expectedUsername = getAdminUsername();
  const expectedPassword = getAdminPassword();

  // If ADMIN_PASSWORD is missing or not set in environment, fail securely
  if (!expectedPassword) {
    return res.status(401).json({
      success: false,
      error: 'Invalid username or password.'
    });
  }

  const usernameMatch =
    String(username).trim().toLowerCase() === expectedUsername.toLowerCase();

  const providedPassword = String(password).trim();
  const passwordMatch = safeCompare(providedPassword, expectedPassword);

  if (!usernameMatch || !passwordMatch) {
    // Intentional delay to mitigate brute-force attempts
    await new Promise((resolve) => setTimeout(resolve, 350));
    return res.status(401).json({
      success: false,
      error: 'Invalid username or password.'
    });
  }

  // Generate secure session token
  const token = crypto.randomBytes(32).toString('hex');
  const sessionDurationMs = 24 * 60 * 60 * 1000; // 24 hours
  const session: AdminSession = {
    token,
    username: expectedUsername,
    createdAt: Date.now(),
    expiresAt: Date.now() + sessionDurationMs
  };

  serverlessSessions.set(token, session);

  return res.status(200).json({
    success: true,
    token,
    username: expectedUsername,
    expiresIn: sessionDurationMs / 1000
  });
}
