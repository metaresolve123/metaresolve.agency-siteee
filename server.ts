import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  getAllLeads,
  createLeadRecord,
  updateLeadStatusRecord,
  updateLeadNotesRecord,
  deleteLeadRecord,
  getStoredSiteConfig,
  updateStoredSiteConfig,
  LeadStatus,
  PlatformType
} from './serverStorage';

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

// Read admin password dynamically from environment variables (defaults to adilxmetaxhuzzi if not overridden)
const getAdminPassword = (): string => {
  const envPass = (process.env.ADMIN_PASSWORD || '').trim();
  if (envPass && envPass !== '@adilxhuzzi#') {
    return envPass;
  }
  return 'adilxmetaxhuzzi';
};

// Timing safe comparison for passwords using fixed-length SHA-256 hashes to prevent timing attacks & length leaks
function safeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
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

  // ----------------------------------------------------
  // PUBLIC CONTACT FORM / LEAD SUBMISSION ENDPOINT
  // ----------------------------------------------------
  const handleLeadSubmission = (req: express.Request, res: express.Response) => {
    try {
      const {
        fullName,
        name,
        email,
        phone,
        service,
        details,
        platform,
        accountType,
        banReason,
        accountHandle,
        urgency,
        caseId
      } = req.body || {};

      const clientName = (name || fullName || '').trim();
      const clientEmail = (email || '').trim();
      const clientPhone = (phone || '').trim();
      const caseDetails = (details || '').trim();

      // Server-side validation
      if (!clientName) {
        return res.status(400).json({
          success: false,
          error: 'Client name is required.'
        });
      }

      if (!clientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
        return res.status(400).json({
          success: false,
          error: 'A valid email address is required.'
        });
      }

      if (!clientPhone || clientPhone.length < 5) {
        return res.status(400).json({
          success: false,
          error: 'A valid phone/WhatsApp number is required.'
        });
      }

      if (!caseDetails || caseDetails.length < 5) {
        return res.status(400).json({
          success: false,
          error: 'Case description is required.'
        });
      }

      // Persist to persistent database
      const newLead = createLeadRecord({
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        service: service ? String(service).trim() : undefined,
        platform: platform as PlatformType,
        accountType: accountType ? String(accountType).trim() : undefined,
        banReason: banReason ? String(banReason).trim() : undefined,
        accountHandle: accountHandle ? String(accountHandle).trim() : undefined,
        details: caseDetails,
        urgency: urgency === 'standard' ? 'standard' : 'critical',
        caseId: caseId ? String(caseId).trim() : undefined
      });

      return res.status(201).json({
        success: true,
        message: 'Case created and recorded successfully in Admin Case Pipeline.',
        caseId: newLead.id,
        lead: newLead
      });
    } catch (err: any) {
      console.error('Error handling lead submission:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to record case submission. Please try again.'
      });
    }
  };

  app.post('/api/leads', handleLeadSubmission);
  app.post('/api/contact', handleLeadSubmission);

  // Public Site Config read
  app.get('/api/site-config', (req, res) => {
    const config = getStoredSiteConfig();
    res.json({ success: true, config });
  });

  // ----------------------------------------------------
  // ADMIN AUTHENTICATION ENDPOINTS
  // ----------------------------------------------------

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

  // ----------------------------------------------------
  // PROTECTED ADMIN CASE PIPELINE ENDPOINTS
  // ----------------------------------------------------

  // Get all leads / cases
  app.get('/api/admin/leads', (req, res) => {
    const session = authenticateRequest(req);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Admin login required' });
    }

    const leads = getAllLeads();
    return res.json({ success: true, leads });
  });

  // Manually create lead / sample lead
  app.post('/api/admin/leads', (req, res) => {
    const session = authenticateRequest(req);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Admin login required' });
    }

    const lead = createLeadRecord(req.body || {});
    return res.status(201).json({ success: true, lead });
  });

  // Update lead status
  app.patch('/api/admin/leads/:id/status', (req, res) => {
    const session = authenticateRequest(req);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Admin login required' });
    }

    const { id } = req.params;
    const { status } = req.body || {};

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const updated = updateLeadStatusRecord(id, status as LeadStatus);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Case not found' });
    }

    return res.json({ success: true, lead: updated });
  });

  // Update lead notes
  app.patch('/api/admin/leads/:id/notes', (req, res) => {
    const session = authenticateRequest(req);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Admin login required' });
    }

    const { id } = req.params;
    const { notes } = req.body || {};

    const updated = updateLeadNotesRecord(id, notes || '');
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Case not found' });
    }

    return res.json({ success: true, lead: updated });
  });

  // Delete lead
  app.delete('/api/admin/leads/:id', (req, res) => {
    const session = authenticateRequest(req);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Admin login required' });
    }

    const { id } = req.params;
    const success = deleteLeadRecord(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Case not found or already deleted' });
    }

    return res.json({ success: true, message: 'Case deleted successfully' });
  });

  // Update site config
  app.post('/api/admin/site-config', (req, res) => {
    const session = authenticateRequest(req);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Admin login required' });
    }

    const config = updateStoredSiteConfig(req.body || {});
    return res.json({ success: true, config });
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
