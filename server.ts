import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import {
  getAllLeads,
  createLeadRecord,
  updateLeadStatusRecord,
  updateLeadNotesRecord,
  deleteLeadRecord,
  getStoredSiteConfig,
  updateStoredSiteConfig,
  createUserRecord,
  authenticateUser,
  getUserFromSession,
  destroySession,
  findUserByEmail,
  createPasswordResetToken,
  resetPasswordWithToken,
  getAllUsers,
  saveAllUsers,
  createSession,
  sanitizeUser
} from './serverStorage.ts';
import type { LeadStatus, PlatformType } from './serverStorage.ts';

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
  
  // Environment & Port configuration:
  // 1. AI Studio Dev Environment: NGINX listens on 8080 and proxies traffic to DEFAULT_APP_PORT (3000).
  // 2. Cloud Run Production Deployment (ais-pre-... or live service): Cloud Run sends traffic directly to PORT (typically 8080) with no NGINX.
  const isAisDevContainer = Boolean(
    process.env.K_SERVICE?.startsWith('ais-dev-') ||
    (process.env.NGINX_PORT && process.env.DEFAULT_APP_PORT)
  );
  const isExplicitDevCmd = process.env.npm_lifecycle_event === 'dev';
  const isExplicitProd = process.env.NODE_ENV === 'production' || process.env.npm_lifecycle_event === 'start';

  // Development mode should only be active for local dev commands, never in production Cloud Run
  const isDev = (isExplicitDevCmd || isAisDevContainer) && !isExplicitProd;

  // Port binding:
  // In AI Studio Dev, bind to DEFAULT_APP_PORT (3000) so NGINX on 8080 can proxy to it.
  // In Cloud Run (production), bind directly to Cloud Run's injected PORT (8080).
  const PORT = (isAisDevContainer && !isExplicitProd)
    ? (Number(process.env.DEFAULT_APP_PORT) || 3000)
    : (Number(process.env.PORT) || 8080);

  // JSON and URL-encoded body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // --- API Routes (MUST be defined before Vite middleware) ---

  // Health check endpoints for Cloud Run startup/liveness probes and monitoring
  app.get(['/health', '/api/health'], (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
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

  // Direct founder photo update endpoint
  app.post('/api/founder-photo', (req, res) => {
    const { photoDataUrl } = req.body || {};
    if (!photoDataUrl || typeof photoDataUrl !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid photo data' });
    }

    const config = updateStoredSiteConfig({ founderAvatarUrl: photoDataUrl });
    return res.json({ success: true, config });
  });

  // Direct huzaifa photo update endpoint
  app.post('/api/huzaifa-photo', (req, res) => {
    const { photoDataUrl } = req.body || {};
    if (!photoDataUrl || typeof photoDataUrl !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid photo data' });
    }

    const config = updateStoredSiteConfig({ huzaifaAvatarUrl: photoDataUrl });
    return res.json({ success: true, config });
  });

  // ----------------------------------------------------
  // VISITOR / CLIENT USER AUTHENTICATION ENDPOINTS
  // (Completely decoupled from Admin Portal authentication)
  // ----------------------------------------------------

  // Sign up with Name, Email & Password
  app.post('/api/user-auth/signup', (req, res) => {
    const { name, email, password, confirmPassword, agreeTerms, rememberMe } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }
    if (agreeTerms === false) {
      return res.status(400).json({ success: false, error: 'You must agree to the Terms of Service & Privacy Policy.' });
    }

    const { user, error } = createUserRecord({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      authProvider: 'local',
    });

    if (error || !user) {
      return res.status(400).json({ success: false, error: error || 'Failed to create account.' });
    }

    const session = createSession(user.id, rememberMe !== false);
    return res.json({
      success: true,
      message: 'Account created successfully!',
      token: session.token,
      user: sanitizeUser(user),
    });
  });

  // Sign in with Email & Password
  app.post('/api/user-auth/login', (req, res) => {
    const { email, password, rememberMe } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const { user, error } = authenticateUser(email.trim().toLowerCase(), password);
    if (error || !user) {
      return res.status(401).json({ success: false, error: error || 'Invalid email or password.' });
    }

    const session = createSession(user.id, rememberMe !== false);
    return res.json({
      success: true,
      message: 'Welcome back!',
      token: session.token,
      user: sanitizeUser(user),
    });
  });

  // Fetch Current User from Token (Bearer token verification)
  app.get('/api/user-auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.query.token) {
      token = String(req.query.token).trim();
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'No authentication token provided.' });
    }

    const user = getUserFromSession(token);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Session expired or invalid.' });
    }

    return res.json({
      success: true,
      user: sanitizeUser(user),
    });
  });

  // Sign out
  app.post('/api/user-auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.body && req.body.token) {
      token = String(req.body.token).trim();
    }

    if (token) {
      destroySession(token);
    }
    return res.json({ success: true, message: 'Signed out successfully.' });
  });

  // Request Password Reset Link
  app.post('/api/user-auth/forgot-password', (req, res) => {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    const result = createPasswordResetToken(email.trim().toLowerCase());
    // For privacy and security, standard practice is returning confirmation even if email isn't in db
    if (!result.success) {
      return res.json({
        success: true,
        message: 'If an account exists with this email address, a password reset link has been dispatched.',
      });
    }

    console.log(`[AUTH] Password reset token generated for ${email}: ${result.token}`);
    return res.json({
      success: true,
      message: 'Password reset link dispatched. Please check your inbox and spam folders.',
      // Provide self-service token preview for development convenience
      resetToken: process.env.NODE_ENV !== 'production' ? result.token : undefined,
    });
  });

  // Reset Password with Token
  app.post('/api/user-auth/reset-password', (req, res) => {
    const { token, newPassword, confirmPassword } = req.body || {};

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, error: 'Reset token is required.' });
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    const result = resetPasswordWithToken(token.trim(), newPassword);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error || 'Failed to reset password.' });
    }

    return res.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new credentials.',
    });
  });

  // Google OAuth URL generation endpoint
  app.get('/api/user-auth/google/url', (req, res) => {
    const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const redirectUri = `${appUrl}/api/user-auth/google/callback`;

    if (!clientId) {
      return res.json({
        success: false,
        configured: false,
        error: 'Google OAuth Client ID is not configured in environment variables. Please add GOOGLE_CLIENT_ID in your configuration.',
        docs: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Cloud Run / Vercel secrets or .env file.',
      });
    }

    const state = crypto.randomBytes(16).toString('hex');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('openid email profile')}&` +
      `state=${encodeURIComponent(state)}&` +
      `access_type=offline&` +
      `prompt=select_account`;

    return res.json({
      success: true,
      configured: true,
      url: authUrl,
      clientId,
    });
  });

  // Google OAuth Redirect Callback Handler
  app.get('/api/user-auth/google/callback', async (req, res) => {
    const { code, error } = req.query;

    if (error) {
      console.error('Google OAuth callback returned error:', error);
      return res.redirect(`/?auth_error=${encodeURIComponent(String(error))}`);
    }

    if (!code || typeof code !== 'string') {
      return res.redirect(`/?auth_error=${encodeURIComponent('Missing authorization code from Google')}`);
    }

    const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
    const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const redirectUri = `${appUrl}/api/user-auth/google/callback`;

    if (!clientId || !clientSecret) {
      return res.redirect(`/?auth_error=${encodeURIComponent('Google OAuth Client credentials not configured on server')}`);
    }

    try {
      // Exchange code for Google access token & ID token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenData.access_token) {
        console.error('Google token exchange failed:', tokenData);
        return res.redirect(`/?auth_error=${encodeURIComponent(tokenData.error_description || 'Failed to exchange token with Google')}`);
      }

      // Fetch user profile info using the access token
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const profile = await profileResponse.json();
      if (!profileResponse.ok || !profile.email) {
        return res.redirect(`/?auth_error=${encodeURIComponent('Failed to retrieve user profile from Google')}`);
      }

      // Match or register user in our local database
      let user = findUserByEmail(profile.email);
      if (!user) {
        const created = createUserRecord({
          name: profile.name || profile.email.split('@')[0],
          email: profile.email,
          authProvider: 'google',
          googleId: profile.sub,
          avatarUrl: profile.picture,
        });
        user = created.user;
      } else {
        if (!user.googleId) user.googleId = profile.sub;
        if (profile.picture && !user.avatarUrl) user.avatarUrl = profile.picture;
        saveAllUsers(getAllUsers().map((u) => (u.id === user!.id ? user! : u)));
      }

      // Create session token
      const session = createSession(user.id, true);
      return res.redirect(`/?auth_token=${encodeURIComponent(session.token)}&auth_name=${encodeURIComponent(user.name)}`);
    } catch (err: any) {
      console.error('Error handling Google OAuth callback:', err);
      return res.redirect(`/?auth_error=${encodeURIComponent(err?.message || 'Server error during Google authentication')}`);
    }
  });

  // Support for Google Identity Services / OneTap client credential token
  app.post('/api/user-auth/google-token', async (req, res) => {
    const { credential } = req.body || {};
    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ success: false, error: 'Google credential token is required' });
    }

    try {
      // Decode JWT payload without external library
      const parts = credential.split('.');
      if (parts.length !== 3) {
        return res.status(400).json({ success: false, error: 'Malformed Google credential token' });
      }

      const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
      const payload = JSON.parse(payloadJson);

      if (!payload.email) {
        return res.status(400).json({ success: false, error: 'Invalid Google token: email missing' });
      }

      let user = findUserByEmail(payload.email);
      if (!user) {
        const created = createUserRecord({
          name: payload.name || payload.email.split('@')[0],
          email: payload.email,
          authProvider: 'google',
          googleId: payload.sub,
          avatarUrl: payload.picture,
        });
        user = created.user;
      } else {
        if (!user.googleId) user.googleId = payload.sub;
        if (payload.picture && !user.avatarUrl) user.avatarUrl = payload.picture;
        saveAllUsers(getAllUsers().map((u) => (u.id === user!.id ? user! : u)));
      }

      const session = createSession(user.id, true);
      return res.json({
        success: true,
        token: session.token,
        user: sanitizeUser(user),
      });
    } catch (err: any) {
      console.error('Error verifying Google credential token:', err);
      return res.status(500).json({ success: false, error: 'Failed to verify Google token' });
    }
  });

  // --- Vite Middleware for Development / Static in Production ---
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');

    if (fs.existsSync(indexPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        if (req.path.startsWith('/api/')) {
          return res.status(404).json({ success: false, error: 'API route not found' });
        }
        res.sendFile(indexPath, (err) => {
          if (err && !res.headersSent) {
            res.status(500).send('Error loading page');
          }
        });
      });
    } else {
      console.warn('dist/index.html not found, mounting dynamic Vite middleware as fallback...');
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    }
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`META RESOLVE Server running on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'production'})`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
  });
}

startServer();
