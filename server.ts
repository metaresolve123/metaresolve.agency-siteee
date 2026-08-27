import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load .env file with override option so updated local .env takes precedence if present
dotenv.config({ override: true });

interface AdminSession {
  token: string;
  username: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory runtime session store
const sessions = new Map<string, AdminSession>();

// Read admin username dynamically from environment on every check (default 'metaresolve')
const getAdminUsername = (): string => {
  return (process.env.ADMIN_USERNAME || 'metaresolve').trim();
};

// Read admin password dynamically from environment variables on every check
// No fallback or hard-coded default password - must strictly match process.env.ADMIN_PASSWORD
const getAdminPassword = (): string => {
  return (process.env.ADMIN_PASSWORD || '').trim();
};

// Timing safe comparison for passwords to prevent timing attacks
function safeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Helper to authenticate Bearer token from request
function authenticateRequest(req: express.Request): AdminSession | null {
  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.body && req.body.token) {
    token = String(req.body.token).trim();
  }

  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  return session;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON and URL-encoded body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // --- API Routes (MUST be defined before Vite middleware) ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Admin Login Endpoint
  app.post('/api/admin/login', (req, res) => {
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
      setTimeout(() => {
        res.status(401).json({
          success: false,
          error: 'Invalid username or password.'
        });
      }, 350);
      return;
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

    sessions.set(token, session);

    return res.json({
      success: true,
      token,
      username: expectedUsername,
      expiresIn: sessionDurationMs / 1000
    });
  });

  // Admin Session Verification Endpoint
  app.post('/api/admin/verify', (req, res) => {
    const session = authenticateRequest(req);
    if (!session) {
      return res.status(401).json({
        success: false,
        valid: false,
        error: 'Session is invalid or expired.'
      });
    }

    return res.json({
      success: true,
      valid: true,
      username: session.username,
      expiresAt: session.expiresAt
    });
  });

  // Admin Logout Endpoint
  app.post('/api/admin/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.body && req.body.token) {
      token = String(req.body.token).trim();
    }

    if (token) {
      sessions.delete(token);
    }

    return res.json({ success: true, message: 'Logged out successfully.' });
  });

  // Admin Password Update Endpoint (Session Protected)
  app.post('/api/admin/change-password', (req, res) => {
    const session = authenticateRequest(req);
    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Valid admin session required.'
      });
    }

    const { currentPassword, newPassword } = req.body || {};
    if (!newPassword || String(newPassword).trim().length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long.'
      });
    }

    const expectedPassword = getAdminPassword();
    const providedCurrent = String(currentPassword).trim();

    if (!expectedPassword || !safeCompare(providedCurrent, expectedPassword)) {
      return res.status(401).json({
        success: false,
        error: 'Current password does not match.'
      });
    }

    return res.json({
      success: true,
      message: 'To change the admin password permanently, update the ADMIN_PASSWORD environment variable in your Vercel project settings.'
    });
  });

  // Admin Status info (Does NOT expose passwords)
  app.get('/api/admin/status', (req, res) => {
    const session = authenticateRequest(req);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    res.json({
      success: true,
      username: getAdminUsername(),
      hasEnvPasswordConfigured: Boolean(getAdminPassword()),
      activeSessionsCount: sessions.size
    });
  });

  // --- Vite Middleware for Development / Static in Production ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`META RESOLVE Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
