/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  salt?: string;
  authProvider: 'local' | 'google';
  googleId?: string;
  avatarUrl?: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  createdAt: string;
  lastLoginAt: string;
}

export interface SanitizedUser {
  id: string;
  name: string;
  email: string;
  authProvider: 'local' | 'google';
  avatarUrl?: string;
  createdAt: string;
}

const SESSION_TTL_STANDARD = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_TTL_REMEMBER = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.GOOGLE_CLIENT_SECRET ||
    'metaresolve_secure_session_secret_2026'
  );
}

// Global in-memory cache for serverless functions
const globalCache = globalThis as unknown as {
  serverlessUsers?: StoredUser[];
  serverlessResetTokens?: Map<string, { email: string; expiresAt: number }>;
};

if (!globalCache.serverlessUsers) {
  // Pre-seed verified demo user
  const demoSalt = crypto.randomBytes(16).toString('hex');
  const demoHash = crypto.scryptSync('MetaClient2026!', demoSalt, 64).toString('hex');
  globalCache.serverlessUsers = [
    {
      id: 'USR-1001',
      name: 'Verified Client',
      email: 'client@metaresolve.com',
      passwordHash: demoHash,
      salt: demoSalt,
      authProvider: 'local',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }
  ];
}

if (!globalCache.serverlessResetTokens) {
  globalCache.serverlessResetTokens = new Map();
}

// Storage path detection (writable /tmp fallback for Vercel)
function getStorageFile(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDir = path.join('/tmp', 'metaresolve_data');
    try {
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      return path.join(tmpDir, 'users.json');
    } catch {
      return path.join('/tmp', 'metaresolve_users.json');
    }
  }

  const localDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    return path.join(localDir, 'users.json');
  } catch {
    return path.join('/tmp', 'metaresolve_users.json');
  }
}

export function sanitize(u: StoredUser): SanitizedUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    authProvider: u.authProvider,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt,
  };
}

export function loadUsers(): StoredUser[] {
  try {
    const filePath = getStorageFile();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalCache.serverlessUsers = parsed;
        return parsed;
      }
    }
  } catch (err) {
    // ignore filesystem read error in read-only environment
  }
  return globalCache.serverlessUsers || [];
}

export function saveUsers(users: StoredUser[]): void {
  globalCache.serverlessUsers = users;
  try {
    const filePath = getStorageFile();
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch {
    // fallback to in-memory
  }
}

const b64url = (buf: Buffer | string) =>
  Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const fromB64url = (str: string) =>
  Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

// Cryptographically sign user session token (HMAC-SHA256)
export function signSessionToken(user: SanitizedUser, rememberMe: boolean = true): string {
  const ttl = rememberMe ? SESSION_TTL_REMEMBER : SESSION_TTL_STANDARD;
  const payload = b64url(
    JSON.stringify({
      user,
      exp: Date.now() + ttl,
    })
  );
  const sig = b64url(crypto.createHmac('sha256', getSecret()).update(payload).digest());
  return `${payload}.${sig}`;
}

// Verify HMAC session token
export function verifySessionToken(token: string): SanitizedUser | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, sig] = parts;

    const expected = b64url(crypto.createHmac('sha256', getSecret()).update(payload).digest());
    const bufA = Buffer.from(sig);
    const bufB = Buffer.from(expected);
    if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
      return null;
    }

    const data = JSON.parse(fromB64url(payload).toString('utf-8'));
    if (!data?.exp || Date.now() > data.exp) {
      return null;
    }

    return data.user as SanitizedUser;
  } catch {
    return null;
  }
}

export function parseRequestBody(req: any): any {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  return body || {};
}

export function getBearerToken(req: any): string {
  const h = req.headers?.authorization || req.headers?.Authorization;
  if (h && typeof h === 'string' && h.startsWith('Bearer ')) {
    return h.substring(7).trim();
  }
  if (req.query?.token) return String(req.query.token).trim();
  const body = parseRequestBody(req);
  if (body.token) return String(body.token).trim();
  return '';
}

export function sendResponse(res: any, status: number, body: any): void {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(status).json(body);
}
