import { LeadRecord, SiteConfig, LeadFormData, LeadStatus } from '../types';

const LEADS_STORAGE_KEY = 'metaresolve_leads_data';
const SITE_CONFIG_STORAGE_KEY = 'metaresolve_site_config';
const ADMIN_SESSION_TOKEN_KEY = 'metaresolve_admin_token';
const ADMIN_USERNAME_KEY = 'metaresolve_admin_user';

export const DEFAULT_SITE_CONFIG: SiteConfig = {
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
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
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
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
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
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 36 hours ago
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

// --- Leads Management ---
export function getLeads(): LeadRecord[] {
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_LEADS));
      return INITIAL_SAMPLE_LEADS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load leads from localStorage', e);
    return INITIAL_SAMPLE_LEADS;
  }
}

export function saveLead(formData: LeadFormData, caseId?: string): LeadRecord {
  const leads = getLeads();
  const newLead: LeadRecord = {
    id: caseId || `META-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString(),
    name: formData.name,
    email: formData.email,
    phone: formData.phone || '',
    platform: formData.platform || 'other',
    accountType: formData.accountType || formData.service || 'Account Recovery',
    banReason: formData.banReason || 'Restricted / Suspended Account',
    accountHandle: formData.accountHandle || '',
    details: formData.details,
    urgency: formData.urgency || 'critical',
    status: 'new',
    adminNotes: formData.service ? `Requested Service: ${formData.service}` : '',
  };

  const updated = [newLead, ...leads];
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('metaresolve_lead_added', { detail: newLead }));
  } catch (e) {
    console.error('Failed to save lead', e);
  }

  return newLead;
}

export function updateLeadStatus(id: string, status: LeadStatus): void {
  const leads = getLeads();
  const updated = leads.map(item => item.id === id ? { ...item, status } : item);
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('metaresolve_leads_updated'));
}

export function updateLeadNotes(id: string, notes: string): void {
  const leads = getLeads();
  const updated = leads.map(item => item.id === id ? { ...item, adminNotes: notes } : item);
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('metaresolve_leads_updated'));
}

export function deleteLead(id: string): void {
  const leads = getLeads();
  const updated = leads.filter(item => item.id !== id);
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('metaresolve_leads_updated'));
}

// --- Site Configuration Controls ---
export function getSiteConfig(): SiteConfig {
  try {
    const raw = localStorage.getItem(SITE_CONFIG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_SITE_CONFIG));
      return DEFAULT_SITE_CONFIG;
    }
    return { ...DEFAULT_SITE_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SITE_CONFIG;
  }
}

export function updateSiteConfig(partial: Partial<SiteConfig>): SiteConfig {
  const current = getSiteConfig();
  const updated = { ...current, ...partial };
  try {
    localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('metaresolve_config_updated', { detail: updated }));
  } catch (e) {
    console.error('Failed to save site config', e);
  }
  return updated;
}

// --- Admin Authentication (Secure Server-Side Authentication) ---

export function getStoredAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_SESSION_TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function getStoredAdminUsername(): string {
  try {
    return localStorage.getItem(ADMIN_USERNAME_KEY) || 'metaresolve';
  } catch (e) {
    return 'metaresolve';
  }
}

export async function loginAdmin(
  adminIdInput: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string; username?: string }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: adminIdInput.trim(),
        password: passwordInput.trim()
      })
    });

    const data = await res.json();
    if (res.ok && data.success && data.token) {
      try {
        localStorage.setItem(ADMIN_SESSION_TOKEN_KEY, data.token);
        localStorage.setItem(ADMIN_USERNAME_KEY, data.username || 'metaresolve');
      } catch (e) {
        console.error('Failed to store session token', e);
      }
      return { success: true, username: data.username || 'metaresolve' };
    }

    return {
      success: false,
      error: data.error || 'Invalid username or password.'
    };
  } catch (err) {
    console.error('Server login request error', err);
    return {
      success: false,
      error: 'Authentication service unavailable. Please try again.'
    };
  }
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = getStoredAdminToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ token })
    });

    if (res.ok) {
      const data = await res.json();
      return Boolean(data.valid);
    } else {
      // Clear expired / invalid token
      logoutAdmin();
      return false;
    }
  } catch (e) {
    // If offline or network issue, token remains in storage but we don't assume invalid immediately
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  const token = getStoredAdminToken();
  try {
    if (token) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ token })
      });
    }
  } catch (e) {
    // ignore
  } finally {
    try {
      localStorage.removeItem(ADMIN_SESSION_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USERNAME_KEY);
    } catch (e) {
      // ignore
    }
  }
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const token = getStoredAdminToken();
  if (!token) {
    return { success: false, error: 'Session expired. Please log in again.' };
  }

  try {
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim()
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || 'Failed to update admin password.' };
  } catch (err) {
    return { success: false, error: 'Failed to communicate with authentication server.' };
  }
}

