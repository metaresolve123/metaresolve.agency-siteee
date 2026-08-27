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

// --- In-memory local cache ---
let inMemoryLeadsCache: LeadRecord[] | null = null;

// Synchronously get leads from cache or local storage fallback
export function getLeads(): LeadRecord[] {
  if (inMemoryLeadsCache && inMemoryLeadsCache.length > 0) {
    return inMemoryLeadsCache;
  }
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryLeadsCache = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load leads from localStorage', e);
  }
  return INITIAL_SAMPLE_LEADS;
}

// Asynchronously fetch latest leads from the server database (Admin authenticated)
export async function fetchLeadsFromServer(): Promise<LeadRecord[]> {
  const token = getStoredAdminToken();
  if (!token) {
    return getLeads();
  }

  try {
    const res = await fetch('/api/admin/leads', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        inMemoryLeadsCache = data.leads;
        try {
          localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(data.leads));
        } catch (e) {
          // ignore
        }
        return data.leads;
      }
    }
  } catch (err) {
    console.warn('Network error while fetching leads from server, using local cache:', err);
  }

  return getLeads();
}

// Save lead from Contact Form to persistent server database
export async function saveLead(
  formData: LeadFormData,
  caseId?: string
): Promise<{ success: boolean; lead: LeadRecord }> {
  const generatedId = caseId || `META-${Math.floor(100000 + Math.random() * 900000)}`;

  const localLead: LeadRecord = {
    id: generatedId,
    createdAt: new Date().toISOString(),
    name: formData.name.trim(),
    email: formData.email.trim(),
    phone: formData.phone?.trim() || '',
    platform: formData.platform || 'other',
    accountType: formData.accountType || formData.service || 'Account Recovery',
    banReason: formData.banReason || 'Restricted / Suspended Account',
    accountHandle: formData.accountHandle?.trim() || formData.name.trim(),
    details: formData.details.trim(),
    urgency: formData.urgency || 'critical',
    status: 'new',
    adminNotes: formData.service ? `Requested Service: ${formData.service}` : '',
  };

  // Optimistically update local cache
  const current = getLeads();
  const updated = [localLead, ...current.filter(l => l.id !== localLead.id)];
  inMemoryLeadsCache = updated;
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('metaresolve_lead_added', { detail: localLead }));
  } catch (e) {
    console.error('Failed to write local lead cache', e);
  }

  // Send to backend server for permanent database storage
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: formData.name,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        platform: formData.platform,
        accountType: formData.accountType,
        banReason: formData.banReason,
        accountHandle: formData.accountHandle,
        details: formData.details,
        urgency: formData.urgency,
        caseId: generatedId
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.lead) {
        // Sync returned lead data
        const syncedLeads = [data.lead, ...getLeads().filter(l => l.id !== data.lead.id)];
        inMemoryLeadsCache = syncedLeads;
        try {
          localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(syncedLeads));
        } catch (e) {
          // ignore
        }
        return { success: true, lead: data.lead };
      }
    }
  } catch (err) {
    console.error('Failed to transmit lead to server database:', err);
  }

  return { success: true, lead: localLead };
}

// Update lead status on server and local cache
export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  const current = getLeads();
  const updated = current.map(item => item.id === id ? { ...item, status } : item);
  inMemoryLeadsCache = updated;
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('metaresolve_leads_updated'));
  } catch (e) {
    // ignore
  }

  const token = getStoredAdminToken();
  if (token) {
    try {
      await fetch(`/api/admin/leads/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.error('Failed to sync lead status update to server:', err);
    }
  }
}

// Update lead casework notes on server and local cache
export async function updateLeadNotes(id: string, notes: string): Promise<void> {
  const current = getLeads();
  const updated = current.map(item => item.id === id ? { ...item, adminNotes: notes } : item);
  inMemoryLeadsCache = updated;
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('metaresolve_leads_updated'));
  } catch (e) {
    // ignore
  }

  const token = getStoredAdminToken();
  if (token) {
    try {
      await fetch(`/api/admin/leads/${id}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notes })
      });
    } catch (err) {
      console.error('Failed to sync lead notes update to server:', err);
    }
  }
}

// Delete lead from server and local cache
export async function deleteLead(id: string): Promise<void> {
  const current = getLeads();
  const updated = current.filter(item => item.id !== id);
  inMemoryLeadsCache = updated;
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('metaresolve_leads_updated'));
  } catch (e) {
    // ignore
  }

  const token = getStoredAdminToken();
  if (token) {
    try {
      await fetch(`/api/admin/leads/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Failed to sync delete to server:', err);
    }
  }
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

export async function fetchSiteConfigFromServer(): Promise<SiteConfig> {
  try {
    const res = await fetch('/api/site-config');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.config) {
        localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(data.config));
        return data.config;
      }
    }
  } catch (err) {
    // ignore
  }
  return getSiteConfig();
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

  const token = getStoredAdminToken();
  if (token) {
    fetch('/api/admin/site-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updated)
    }).catch((err) => console.error('Failed to sync site config to server:', err));
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


