import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type PlatformType = 'instagram' | 'facebook' | 'tiktok' | 'telegram' | 'x' | 'whatsapp' | 'other';
export type LeadStatus = 'new' | 'reviewing' | 'appealing' | 'resolved' | 'declined';

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

export interface UserSession {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
  rememberMe: boolean;
}

export interface SanitizedUser {
  id: string;
  name: string;
  email: string;
  authProvider: 'local' | 'google';
  avatarUrl?: string;
  createdAt: string;
}

export interface LeadRecord {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  platform: PlatformType;
  accountType: string;
  banReason: string;
  accountHandle: string;
  details: string;
  urgency: 'standard' | 'critical';
  status: LeadStatus;
  adminNotes?: string;
}

export interface SiteConfig {
  officialEmail?: string;
  whatsappNumber: string;
  whatsappDisplayNumber: string;
  founderName: string;
  founderAvatarUrl?: string;
  huzaifaAvatarUrl?: string;
  caseworkStatus: 'Open' | 'High Priority Only' | 'Limited Intake';
  bannerAnnouncement: string;
  bannerEnabled: boolean;
}

const DEFAULT_SITE_CONFIG: SiteConfig = {
  officialEmail: 'metaresolveagency@proton.me',
  whatsappNumber: '923372430274',
  whatsappDisplayNumber: '+92 337 2430274',
  founderName: 'Adil Afridi',
  huzaifaAvatarUrl: '/images/huzaifa-profile.jpg',
  caseworkStatus: 'Open',
  bannerAnnouncement: 'Priority Casework Queue Active: 24/7 Account Recovery & Direct Appeals Support',
  bannerEnabled: true,
};

const INITIAL_SAMPLE_LEADS: LeadRecord[] = [
  {
    id: 'META-982144',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    name: 'Sarah Jenkins',
    email: 'sarah@luxebeautylab.com',
    phone: '+1 415 890 2231',
    platform: 'instagram',
    accountType: 'Business Manager / Creator Channel',
    banReason: 'Policy Violation (Automated Flag)',
    accountHandle: '@luxebeautylab',
    details: 'Our 450k follower verified beauty creator account was disabled without prior warning during an ad campaign launch. Revenue impact is ~$3,500/day. Need urgent Meta concierge escalation.',
    urgency: 'critical',
    status: 'new',
    adminNotes: 'Priority client. Reached out via WhatsApp with intake checklist.',
  },
  {
    id: 'META-762910',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    name: 'David Chen',
    email: 'd.chen@apexmedia.co',
    phone: '+1 212 555 9081',
    platform: 'facebook',
    accountType: 'Business Manager / Ad Account',
    banReason: 'Suspicious Activity / Hacked Recovery',
    accountHandle: 'business.facebook.com/apex-media-group',
    details: 'Ad account restricted after unauthorized admin added from unknown IP. 2FA was bypassed. Primary agency BM holds 14 client ad assets.',
    urgency: 'critical',
    status: 'reviewing',
    adminNotes: 'Security forensics review ongoing. Filing tier-2 business manager appeal.',
  },
  {
    id: 'META-412089',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    name: 'Tariq Al-Mansoor',
    email: 'tariq@gulflogistics.ae',
    phone: '+971 50 123 4567',
    platform: 'whatsapp',
    accountType: 'WhatsApp Business API',
    banReason: 'Spam / Automated Filter Flag',
    accountHandle: '+971 4 800 9000 (API WABA)',
    details: 'High-volume customer notification webhook triggered anti-spam restriction. Verified business registration documents ready for submission.',
    urgency: 'standard',
    status: 'appealing',
    adminNotes: 'Direct appeal package sent to WhatsApp Business Support.',
  },
  {
    id: 'META-309112',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    name: 'Marcus Vance',
    email: 'marcus@trendsphere.io',
    phone: '+44 20 7946 0912',
    platform: 'tiktok',
    accountType: 'TikTok Shop / Creator',
    banReason: 'Copyright / Trademark Strike',
    accountHandle: '@trendsphere_shop',
    details: 'False DMCA strike on original video product demo. Counter-notice submitted but pending review for 10 days.',
    urgency: 'standard',
    status: 'resolved',
    adminNotes: 'Counter-notice accepted by legal trust team. Account fully restored.',
  }
];

// Determine data directory location
const DATA_DIR = path.join(process.cwd(), 'data');
const CASES_FILE = path.join(DATA_DIR, 'cases.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'user_sessions.json');

// Global in-memory fallback cache for serverless environments
const globalStorage = global as unknown as {
  inMemoryLeads?: LeadRecord[];
  inMemoryConfig?: SiteConfig;
  inMemoryUsers?: StoredUser[];
  inMemorySessions?: UserSession[];
};

function ensureDataDirectory(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // In serverless / read-only filesystem environments, disk access might fail
    console.warn('Could not create data directory, using in-memory store:', err);
  }
}

// Ensure cases and user files exist and have initial data
function initFiles(): void {
  ensureDataDirectory();
  try {
    if (!fs.existsSync(CASES_FILE)) {
      fs.writeFileSync(CASES_FILE, JSON.stringify(INITIAL_SAMPLE_LEADS, null, 2), 'utf-8');
    }
    if (!fs.existsSync(CONFIG_FILE)) {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_SITE_CONFIG, null, 2), 'utf-8');
    }
    if (!fs.existsSync(USERS_FILE)) {
      // Seed initial verified demo user
      const demoSalt = crypto.randomBytes(16).toString('hex');
      const demoHash = crypto.scryptSync('MetaClient2026!', demoSalt, 64).toString('hex');
      const initialUsers: StoredUser[] = [
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
      fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), 'utf-8');
    }
    if (!fs.existsSync(SESSIONS_FILE)) {
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('Could not initialize data files on disk:', err);
  }
}

// Run initial check
initFiles();

export function getAllLeads(): LeadRecord[] {
  try {
    if (fs.existsSync(CASES_FILE)) {
      const content = fs.readFileSync(CASES_FILE, 'utf-8');
      const leads: LeadRecord[] = JSON.parse(content);
      if (Array.isArray(leads)) {
        globalStorage.inMemoryLeads = leads;
        return leads;
      }
    }
  } catch (err) {
    console.error('Error reading cases from disk:', err);
  }

  if (!globalStorage.inMemoryLeads) {
    globalStorage.inMemoryLeads = [...INITIAL_SAMPLE_LEADS];
  }
  return globalStorage.inMemoryLeads;
}

export function saveAllLeads(leads: LeadRecord[]): boolean {
  globalStorage.inMemoryLeads = leads;
  try {
    ensureDataDirectory();
    fs.writeFileSync(CASES_FILE, JSON.stringify(leads, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing cases to disk:', err);
    return false;
  }
}

export function createLeadRecord(data: {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  platform?: PlatformType;
  accountType?: string;
  banReason?: string;
  accountHandle?: string;
  details: string;
  urgency?: 'standard' | 'critical';
  caseId?: string;
}): LeadRecord {
  const currentLeads = getAllLeads();

  // Generate unique Case Ticket ID if not supplied
  let caseId = data.caseId;
  if (!caseId) {
    let candidate = '';
    do {
      candidate = `META-${Math.floor(100000 + Math.random() * 900000)}`;
    } while (currentLeads.some((l) => l.id === candidate));
    caseId = candidate;
  }

  // Determine platform
  let platform: PlatformType = data.platform || 'other';
  if (!data.platform && data.service) {
    const s = data.service.toLowerCase();
    if (s.includes('instagram')) platform = 'instagram';
    else if (s.includes('facebook')) platform = 'facebook';
    else if (s.includes('tiktok')) platform = 'tiktok';
    else if (s.includes('telegram')) platform = 'telegram';
    else if (s.includes('x') || s.includes('twitter')) platform = 'x';
    else if (s.includes('whatsapp')) platform = 'whatsapp';
  }

  const newLead: LeadRecord = {
    id: caseId,
    createdAt: new Date().toISOString(),
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone?.trim() || '',
    platform,
    accountType: data.accountType || data.service || 'Account Recovery',
    banReason: data.banReason || 'Policy Violation / Account Suspension',
    accountHandle: data.accountHandle?.trim() || data.name.trim(),
    details: data.details.trim(),
    urgency: data.urgency || 'critical',
    status: 'new',
    adminNotes: data.service ? `Inquiry for service: ${data.service}` : '',
  };

  // Prepend to leads list so newest leads appear at the top
  const updatedLeads = [newLead, ...currentLeads.filter(l => l.id !== newLead.id)];
  saveAllLeads(updatedLeads);

  return newLead;
}

export function updateLeadStatusRecord(id: string, status: LeadStatus): LeadRecord | null {
  const currentLeads = getAllLeads();
  const index = currentLeads.findIndex((l) => l.id === id);
  if (index === -1) return null;

  currentLeads[index].status = status;
  saveAllLeads(currentLeads);
  return currentLeads[index];
}

export function updateLeadNotesRecord(id: string, notes: string): LeadRecord | null {
  const currentLeads = getAllLeads();
  const index = currentLeads.findIndex((l) => l.id === id);
  if (index === -1) return null;

  currentLeads[index].adminNotes = notes;
  saveAllLeads(currentLeads);
  return currentLeads[index];
}

export function deleteLeadRecord(id: string): boolean {
  const currentLeads = getAllLeads();
  const filtered = currentLeads.filter((l) => l.id !== id);
  if (filtered.length === currentLeads.length) return false;

  saveAllLeads(filtered);
  return true;
}

export function getStoredSiteConfig(): SiteConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const cfg = JSON.parse(content);
      globalStorage.inMemoryConfig = { ...DEFAULT_SITE_CONFIG, ...cfg };
      return globalStorage.inMemoryConfig;
    }
  } catch (err) {
    console.error('Error reading site config from disk:', err);
  }

  if (!globalStorage.inMemoryConfig) {
    globalStorage.inMemoryConfig = { ...DEFAULT_SITE_CONFIG };
  }
  return globalStorage.inMemoryConfig;
}

export function updateStoredSiteConfig(partial: Partial<SiteConfig>): SiteConfig {
  const current = getStoredSiteConfig();
  const updated = { ...current, ...partial };
  globalStorage.inMemoryConfig = updated;

  try {
    ensureDataDirectory();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing site config to disk:', err);
  }

  return updated;
}

// ----------------------------------------------------
// USER ACCOUNTS & SESSIONS REPOSITORY
// ----------------------------------------------------

export function sanitizeUser(user: StoredUser): SanitizedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    authProvider: user.authProvider,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

export function getAllUsers(): StoredUser[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      const users: StoredUser[] = JSON.parse(content);
      if (Array.isArray(users)) {
        globalStorage.inMemoryUsers = users;
        return users;
      }
    }
  } catch (err) {
    console.error('Error reading users from disk:', err);
  }

  if (!globalStorage.inMemoryUsers) {
    globalStorage.inMemoryUsers = [];
  }
  return globalStorage.inMemoryUsers;
}

export function saveAllUsers(users: StoredUser[]): boolean {
  globalStorage.inMemoryUsers = users;
  try {
    ensureDataDirectory();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing users to disk:', err);
    return false;
  }
}

export function getAllSessions(): UserSession[] {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const content = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      const sessions: UserSession[] = JSON.parse(content);
      if (Array.isArray(sessions)) {
        globalStorage.inMemorySessions = sessions;
        return sessions;
      }
    }
  } catch (err) {
    console.error('Error reading sessions from disk:', err);
  }

  if (!globalStorage.inMemorySessions) {
    globalStorage.inMemorySessions = [];
  }
  return globalStorage.inMemorySessions;
}

export function saveAllSessions(sessions: UserSession[]): boolean {
  globalStorage.inMemorySessions = sessions;
  try {
    ensureDataDirectory();
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing sessions to disk:', err);
    return false;
  }
}

export function findUserByEmail(email: string): StoredUser | null {
  const users = getAllUsers();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized) || null;
}

export function findUserById(id: string): StoredUser | null {
  const users = getAllUsers();
  return users.find((u) => u.id === id) || null;
}

export function createSession(userId: string, rememberMe: boolean = true): UserSession {
  const sessions = getAllSessions();
  // Filter expired sessions
  const now = Date.now();
  const validSessions = sessions.filter((s) => s.expiresAt > now);

  const token = crypto.randomBytes(32).toString('hex');
  const duration = rememberMe ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24; // 30 days vs 24 hours
  const newSession: UserSession = {
    token,
    userId,
    createdAt: now,
    expiresAt: now + duration,
    rememberMe,
  };

  validSessions.push(newSession);
  saveAllSessions(validSessions);
  return newSession;
}

export function getUserFromSession(token: string): StoredUser | null {
  if (!token) return null;
  const sessions = getAllSessions();
  const now = Date.now();
  const session = sessions.find((s) => s.token === token && s.expiresAt > now);
  if (!session) return null;

  return findUserById(session.userId);
}

export function destroySession(token: string): boolean {
  if (!token) return false;
  const sessions = getAllSessions();
  const filtered = sessions.filter((s) => s.token !== token);
  saveAllSessions(filtered);
  return true;
}

export function createUserRecord(params: {
  name: string;
  email: string;
  password?: string;
  authProvider: 'local' | 'google';
  googleId?: string;
  avatarUrl?: string;
}): { user: StoredUser; error?: string } {
  const users = getAllUsers();
  const normalizedEmail = params.email.trim().toLowerCase();

  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return { user: existing, error: 'Account already exists with this email address' };
  }

  let passwordHash: string | undefined;
  let salt: string | undefined;

  if (params.password) {
    salt = crypto.randomBytes(16).toString('hex');
    passwordHash = crypto.scryptSync(params.password, salt, 64).toString('hex');
  }

  const newUser: StoredUser = {
    id: `USR-${Math.floor(100000 + Math.random() * 900000)}`,
    name: params.name.trim(),
    email: normalizedEmail,
    passwordHash,
    salt,
    authProvider: params.authProvider,
    googleId: params.googleId,
    avatarUrl: params.avatarUrl,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveAllUsers(users);

  return { user: newUser };
}

export function authenticateUser(email: string, password: string): { user: StoredUser | null; error?: string } {
  const user = findUserByEmail(email);
  if (!user) {
    return { user: null, error: 'No account found with this email address' };
  }

  if (user.authProvider === 'google' && !user.passwordHash) {
    return { user: null, error: 'This account was registered with Google. Please use Continue with Google.' };
  }

  if (!user.passwordHash || !user.salt) {
    return { user: null, error: 'Password authentication not configured for this account' };
  }

  const calculatedHash = crypto.scryptSync(password, user.salt, 64).toString('hex');
  const expectedBuffer = Buffer.from(user.passwordHash, 'hex');
  const calculatedBuffer = Buffer.from(calculatedHash, 'hex');

  if (expectedBuffer.length !== calculatedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, calculatedBuffer)) {
    return { user: null, error: 'Invalid password. Please check your credentials.' };
  }

  // Update last login timestamp
  user.lastLoginAt = new Date().toISOString();
  saveAllUsers(getAllUsers().map((u) => (u.id === user.id ? user : u)));

  return { user };
}

export function createPasswordResetToken(email: string): { success: boolean; token?: string; error?: string } {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, error: 'No account found with this email address.' };
  }

  const token = crypto.randomBytes(24).toString('hex');
  const expiry = Date.now() + 1000 * 60 * 60; // 1 hour

  user.resetToken = token;
  user.resetTokenExpiry = expiry;

  saveAllUsers(getAllUsers().map((u) => (u.id === user.id ? user : u)));
  return { success: true, token };
}

export function resetPasswordWithToken(token: string, newPassword: string): { success: boolean; error?: string } {
  const users = getAllUsers();
  const now = Date.now();
  const user = users.find((u) => u.resetToken === token && u.resetTokenExpiry && u.resetTokenExpiry > now);

  if (!user) {
    return { success: false, error: 'Invalid or expired password reset link. Please request a new one.' };
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.scryptSync(newPassword, salt, 64).toString('hex');

  user.passwordHash = passwordHash;
  user.salt = salt;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  saveAllUsers(users);
  return { success: true };
}

