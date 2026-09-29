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

// Ensure cases file exists and has initial data
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

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function safeCompareHashes(a: string, b: string): boolean {
  if (!a || !b) return false;
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

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

export function createSession(userId: string, rememberMe: boolean = true): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  // 30 days if rememberMe, otherwise 24 hours
  const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const newSession: UserSession = {
    token,
    userId,
    createdAt: now,
    expiresAt: now + duration,
    rememberMe,
  };

  const sessions = getAllSessions().filter((s) => s.expiresAt > now);
  sessions.push(newSession);
  saveAllSessions(sessions);
  return token;
}

export function getUserFromSession(token: string): SanitizedUser | null {
  if (!token) return null;
  const now = Date.now();
  const sessions = getAllSessions();
  const session = sessions.find((s) => s.token === token && s.expiresAt > now);
  if (!session) return null;

  const user = findUserById(session.userId);
  if (!user) return null;
  return sanitizeUser(user);
}

export function destroySession(token: string): boolean {
  if (!token) return false;
  const sessions = getAllSessions().filter((s) => s.token !== token);
  saveAllSessions(sessions);
  return true;
}

export function createUserRecord(params: {
  name: string;
  email: string;
  password?: string;
  authProvider?: 'local' | 'google';
  googleId?: string;
  avatarUrl?: string;
  rememberMe?: boolean;
}): { user: SanitizedUser; token: string } {
  const users = getAllUsers();
  const normalizedEmail = params.email.trim().toLowerCase();

  let salt: string | undefined;
  let passwordHash: string | undefined;

  if (params.password) {
    salt = crypto.randomBytes(16).toString('hex');
    passwordHash = hashPassword(params.password, salt);
  }

  const userId = `USR-${Math.floor(10000 + Math.random() * 90000)}`;
  const newUser: StoredUser = {
    id: userId,
    name: params.name.trim(),
    email: normalizedEmail,
    passwordHash,
    salt,
    authProvider: params.authProvider || 'local',
    googleId: params.googleId,
    avatarUrl: params.avatarUrl,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveAllUsers(users);

  const token = createSession(newUser.id, params.rememberMe ?? true);
  return { user: sanitizeUser(newUser), token };
}

export function authenticateUser(email: string, password: string, rememberMe: boolean = true): { user: SanitizedUser; token: string } | null {
  const user = findUserByEmail(email);
  if (!user || !user.passwordHash || !user.salt) {
    return null;
  }

  const calculatedHash = hashPassword(password, user.salt);
  if (!safeCompareHashes(calculatedHash, user.passwordHash)) {
    return null;
  }

  user.lastLoginAt = new Date().toISOString();
  saveAllUsers(getAllUsers().map((u) => (u.id === user.id ? user : u)));

  const token = createSession(user.id, rememberMe);
  return { user: sanitizeUser(user), token };
}

export function createPasswordResetToken(email: string): { resetToken: string; resetCode: string } | null {
  const user = findUserByEmail(email);
  if (!user) return null;

  const resetToken = crypto.randomBytes(24).toString('hex');
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit verification code

  user.resetToken = `${resetToken}:${resetCode}`;
  user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

  saveAllUsers(getAllUsers().map((u) => (u.id === user.id ? user : u)));
  return { resetToken, resetCode };
}

export function resetPasswordWithToken(tokenOrCode: string, newPassword: string): boolean {
  const users = getAllUsers();
  const cleanInput = tokenOrCode.trim();
  const now = Date.now();

  const user = users.find((u) => {
    if (!u.resetToken || !u.resetTokenExpiry) return false;
    if (u.resetTokenExpiry < now) return false;
    const parts = u.resetToken.split(':');
    return parts[0] === cleanInput || parts[1] === cleanInput;
  });

  if (!user) return false;

  const salt = crypto.randomBytes(16).toString('hex');
  user.passwordHash = hashPassword(newPassword, salt);
  user.salt = salt;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;

  saveAllUsers(users);
  return true;
}
