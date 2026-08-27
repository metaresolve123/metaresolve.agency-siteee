import crypto from 'crypto';

export interface AdminSession {
  token: string;
  username: string;
  createdAt: number;
  expiresAt: number;
}

// Global in-memory cache for serverless invocation lifetime
const globalForSessions = global as unknown as { adminSessions?: Map<string, AdminSession> };
export const serverlessSessions = globalForSessions.adminSessions || new Map<string, AdminSession>();
if (!globalForSessions.adminSessions) {
  globalForSessions.adminSessions = serverlessSessions;
}

export const getAdminUsername = (): string => {
  return (process.env.ADMIN_USERNAME || 'metaresolve').trim();
};

export const getAdminPassword = (): string => {
  return (process.env.ADMIN_PASSWORD || '').trim();
};

export function safeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function authenticateServerlessRequest(req: any): AdminSession | null {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  let token = '';
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.body && req.body.token) {
    token = String(req.body.token).trim();
  }

  if (!token) return null;

  const session = serverlessSessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    serverlessSessions.delete(token);
    return null;
  }

  return session;
}
