import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  LogOut,
  ExternalLink,
  Search,
  Filter,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Mail,
  Phone,
  Settings,
  Users,
  Eye,
  EyeOff,
  ArrowRight,
  Plus,
  RefreshCw,
  Edit3,
  Check,
  X,
  Smartphone,
  Globe,
  Bell,
  FileText
} from 'lucide-react';
import { LeadRecord, LeadStatus, PlatformType, SiteConfig } from '../../types';
import {
  getLeads,
  updateLeadStatus,
  updateLeadNotes,
  deleteLead,
  getSiteConfig,
  updateSiteConfig,
  loginAdmin,
  verifyAdminSession,
  logoutAdmin,
  changeAdminPassword,
  getStoredAdminUsername,
  saveLead
} from '../../utils/adminStorage';

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitAdmin }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminIdInput, setAdminIdInput] = useState<string>('metaresolve');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active Admin View Tab
  const [activeTab, setActiveTab] = useState<'leads' | 'settings' | 'security'>('leads');

  // Leads state
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [caseworkNotes, setCaseworkNotes] = useState<string>('');

  // Site Config state
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(getSiteConfig());
  const [configSuccessMessage, setConfigSuccessMessage] = useState<string>('');

  // Security Credentials state
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [securitySuccessMessage, setSecuritySuccessMessage] = useState<string>('');
  const [securityErrorMessage, setSecurityErrorMessage] = useState<string>('');
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState<boolean>(false);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadLeads = () => {
    const data = getLeads();
    setLeads(data);
  };

  // Check initial server session on mount
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      const isValid = await verifyAdminSession();
      if (isMounted) {
        if (isValid) {
          setIsAuthenticated(true);
          loadLeads();
        } else {
          setIsAuthenticated(false);
        }
      }
    };
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for storage events (e.g. form submitted in another tab or lead added)
  useEffect(() => {
    const handleLeadAdded = () => {
      loadLeads();
      showToast('New lead inquiry received!');
    };
    const handleLeadsUpdated = () => {
      loadLeads();
    };

    window.addEventListener('metaresolve_lead_added', handleLeadAdded);
    window.addEventListener('metaresolve_leads_updated', handleLeadsUpdated);

    return () => {
      window.removeEventListener('metaresolve_lead_added', handleLeadAdded);
      window.removeEventListener('metaresolve_leads_updated', handleLeadsUpdated);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const res = await loginAdmin(adminIdInput, passwordInput);
    setIsLoggingIn(false);

    if (res.success) {
      setIsAuthenticated(true);
      loadLeads();
      setPasswordInput('');
    } else {
      setLoginError(res.error || 'Invalid username or password.');
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        searchQuery === '' ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.accountHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.details.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPlatform = platformFilter === 'all' || lead.platform === platformFilter;
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesUrgency = urgencyFilter === 'all' || lead.urgency === urgencyFilter;

      return matchesSearch && matchesPlatform && matchesStatus && matchesUrgency;
    });
  }, [leads, searchQuery, platformFilter, statusFilter, urgencyFilter]);

  // Lead Actions
  const handleStatusChange = (id: string, newStatus: LeadStatus) => {
    updateLeadStatus(id, newStatus);
    loadLeads();
    showToast(`Status updated to "${newStatus.toUpperCase()}"`);
  };

  const handleDeleteLead = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete lead #${id} (${name})?`)) {
      deleteLead(id);
      loadLeads();
      if (selectedLead?.id === id) {
        setSelectedLead(null);
      }
      showToast('Lead inquiry removed');
    }
  };

  const handleSaveNotes = () => {
    if (selectedLead) {
      updateLeadNotes(selectedLead.id, caseworkNotes);
      loadLeads();
      setSelectedLead((prev) => prev ? { ...prev, adminNotes: caseworkNotes } : null);
      showToast('Casework notes saved');
    }
  };

  const handleSaveSiteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateSiteConfig(siteConfig);
    setSiteConfig(updated);
    setConfigSuccessMessage('Website settings successfully updated and live globally!');
    setTimeout(() => setConfigSuccessMessage(''), 4000);
    showToast('Website configurations saved');
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityErrorMessage('');
    setSecuritySuccessMessage('');

    if (!currentPasswordInput) {
      setSecurityErrorMessage('Current password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setSecurityErrorMessage('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityErrorMessage('New passwords do not match.');
      return;
    }

    setIsUpdatingSecurity(true);
    const res = await changeAdminPassword(currentPasswordInput, newPassword);
    setIsUpdatingSecurity(false);

    if (res.success) {
      setSecuritySuccessMessage(res.message || 'Admin credentials updated successfully!');
      setCurrentPasswordInput('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Credentials updated successfully');
    } else {
      setSecurityErrorMessage(res.error || 'Failed to update credentials. Please verify your current password.');
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) {
      alert('No leads to export');
      return;
    }
    const headers = ['Case ID', 'Created At', 'Client Name', 'Email', 'Platform', 'Account Type', 'Handle', 'Ban Reason', 'Urgency', 'Status', 'Details', 'Admin Notes'];
    const rows = leads.map((l) => [
      `"${l.id}"`,
      `"${new Date(l.createdAt).toLocaleString()}"`,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email}"`,
      `"${l.platform.toUpperCase()}"`,
      `"${l.accountType}"`,
      `"${l.accountHandle.replace(/"/g, '""')}"`,
      `"${l.banReason}"`,
      `"${l.urgency}"`,
      `"${l.status}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${(l.adminNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `metaresolve_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Leads CSV exported');
  };

  const handleCreateTestLead = () => {
    const platforms: PlatformType[] = ['instagram', 'facebook', 'tiktok', 'whatsapp', 'telegram'];
    const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
    const sample = {
      name: `Test Client ${Math.floor(Math.random() * 900 + 100)}`,
      email: `client${Math.floor(Math.random() * 900)}@company.com`,
      platform: randomPlatform,
      accountType: 'Business / Verified Creator',
      banReason: 'Automated Moderation False Flag',
      accountHandle: `@test_${randomPlatform}_account`,
      details: 'Automated test inquiry created from Admin Panel to test lead intake pipeline and WhatsApp routing.',
      urgency: Math.random() > 0.5 ? ('critical' as const) : ('standard' as const),
    };
    saveLead(sample);
    loadLeads();
    showToast('Sample test lead created');
  };

  const getStatusBadgeColor = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'reviewing':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'appealing':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'resolved':
        return 'bg-[#B7FF35]/15 text-[#B7FF35] border-[#B7FF35]/40';
      case 'declined':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/15 text-gray-400 border-gray-500/30';
    }
  };

  // ----------------------------------------------------
  // LOGIN SCREEN (When Not Authenticated)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070A0A] text-[#F2F5EF] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#B7FF35]/[0.035] blur-[160px] pointer-events-none rounded-full" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-[#0F1615] border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#15201C] border border-[#B7FF35]/40 text-[#B7FF35] flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(183,255,53,0.2)]">
              <Lock className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#15201C] border border-[#B7FF35]/30 text-[10px] font-mono font-bold tracking-widest text-[#B7FF35] mb-2 uppercase">
              PORTAL ACCESS
            </div>

            <h1 className="text-2xl font-extrabold text-[#F2F5EF] tracking-tight">
              META RESOLVE Admin
            </h1>
            <p className="text-xs text-[#A0AAA3] mt-1.5">
              Secure casework lead management & website controls
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-[#A0AAA3] uppercase tracking-wider mb-2">
                Admin Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C9891] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={adminIdInput}
                  onChange={(e) => setAdminIdInput(e.target.value)}
                  placeholder="metaresolve"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0A0E0D] border border-white/10 focus:border-[#B7FF35] rounded-xl text-sm font-mono text-[#F2F5EF] placeholder-[#68736D] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-[#A0AAA3] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#8C9891] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter administrator password"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-[#0A0E0D] border border-white/10 focus:border-[#B7FF35] rounded-xl text-sm text-[#F2F5EF] placeholder-[#68736D] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C9891] hover:text-[#F2F5EF] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-[#B7FF35] hover:bg-[#C7FF45] text-[#090D0D] font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(183,255,53,0.3)] hover:shadow-[0_0_30px_rgba(183,255,53,0.5)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoggingIn ? (
                <span>Verifying Session...</span>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice (No public credentials displayed) */}
          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A0E0D] border border-white/5 text-[11px] font-mono text-[#A0AAA3]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B7FF35]" />
              <span>Private Access: Server-Authenticated Session</span>
            </div>
            <p className="text-[10px] text-[#68736D] mt-2 font-mono">
              Authorized personnel only. Sessions expire after 24 hours.
            </p>
          </div>

          {/* Exit Link */}
          <div className="mt-6 text-center">
            <button
              onClick={onExitAdmin}
              className="text-xs text-[#A0AAA3] hover:text-[#B7FF35] transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>← Back to META RESOLVE Website</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD
  // ----------------------------------------------------
  const currentAdminUser = getStoredAdminUsername();
  const criticalCount = leads.filter(l => l.urgency === 'critical').length;
  const newCount = leads.filter(l => l.status === 'new').length;
  const resolvedCount = leads.filter(l => l.status === 'resolved').length;

  return (
    <div className="min-h-screen bg-[#070B0A] text-[#F2F5EF]">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#141C19] border border-[#B7FF35]/50 text-[#F2F5EF] text-xs font-mono shadow-2xl flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-[#B7FF35]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0B100F]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#B7FF35] text-[#090D0D] flex items-center justify-center shadow-[0_0_15px_rgba(183,255,53,0.3)]">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-[#F2F5EF]">
                META RESOLVE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#B7FF35]/15 text-[#B7FF35] border border-[#B7FF35]/30">
                ADMIN PANEL
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#8C9891]">
              Owner / Lead Specialist: {siteConfig.founderName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onExitAdmin}
            className="px-3 py-1.5 rounded-lg bg-[#121A18] hover:bg-[#182320] border border-white/10 text-xs font-mono text-[#A0AAA3] hover:text-[#F2F5EF] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Public Website</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-mono text-red-400 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-[#0E1513] border border-white/[0.08] shadow-lg">
            <div className="text-xs font-mono uppercase text-[#8C9891] mb-1">Total Inquiries</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F2F5EF]">{leads.length}</div>
            <div className="text-[11px] font-mono text-[#B7FF35] mt-1">Live submissions</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E1513] border border-white/[0.08] shadow-lg">
            <div className="text-xs font-mono uppercase text-[#8C9891] mb-1">New / Unhandled</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">{newCount}</div>
            <div className="text-[11px] font-mono text-blue-400/80 mt-1">Requires review</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E1513] border border-white/[0.08] shadow-lg">
            <div className="text-xs font-mono uppercase text-[#8C9891] mb-1">Critical Priority</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">{criticalCount}</div>
            <div className="text-[11px] font-mono text-amber-400/80 mt-1">High revenue impact</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0E1513] border border-white/[0.08] shadow-lg">
            <div className="text-xs font-mono uppercase text-[#8C9891] mb-1">Cases Resolved</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#B7FF35]">{resolvedCount}</div>
            <div className="text-[11px] font-mono text-[#B7FF35]/80 mt-1">Reinstatement success</div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-[#B7FF35] text-[#090D0D] shadow-[0_0_15px_rgba(183,255,53,0.3)]'
                : 'text-[#A0AAA3] hover:text-[#F2F5EF] hover:bg-[#121A18]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Case Inquiries & Leads</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'leads' ? 'bg-[#090D0D] text-[#B7FF35]' : 'bg-[#15201C] text-[#A0AAA3]'
            }`}>
              {leads.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#B7FF35] text-[#090D0D] shadow-[0_0_15px_rgba(183,255,53,0.3)]'
                : 'text-[#A0AAA3] hover:text-[#F2F5EF] hover:bg-[#121A18]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Website Controls & WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#B7FF35] text-[#090D0D] shadow-[0_0_15px_rgba(183,255,53,0.3)]'
                : 'text-[#A0AAA3] hover:text-[#F2F5EF] hover:bg-[#121A18]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Change ID & Password</span>
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: LEADS & INQUIRIES MANAGEMENT                  */}
        {/* ==================================================== */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            {/* Filter and Action Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0E1513] border border-white/[0.08] flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#8C9891] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by client name, email, handle, case ID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#090D0D] border border-white/10 focus:border-[#B7FF35] rounded-xl text-xs text-[#F2F5EF] placeholder-[#68736D] outline-none"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="px-3 py-2 bg-[#090D0D] border border-white/10 rounded-xl text-xs font-mono text-[#F2F5EF] outline-none"
                >
                  <option value="all">All Platforms</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                  <option value="x">X</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#090D0D] border border-white/10 rounded-xl text-xs font-mono text-[#F2F5EF] outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="reviewing">In Review</option>
                  <option value="appealing">Appealing</option>
                  <option value="resolved">Resolved</option>
                  <option value="declined">Declined</option>
                </select>

                <select
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                  className="px-3 py-2 bg-[#090D0D] border border-white/10 rounded-xl text-xs font-mono text-[#F2F5EF] outline-none"
                >
                  <option value="all">All Urgency</option>
                  <option value="critical">Critical</option>
                  <option value="standard">Standard</option>
                </select>

                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-[#121A18] hover:bg-[#182320] border border-white/10 text-xs font-mono text-[#F2F5EF] flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Export all leads as CSV file"
                >
                  <Download className="w-3.5 h-3.5 text-[#B7FF35]" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleCreateTestLead}
                  className="px-3 py-2 rounded-xl bg-[#14201C] hover:bg-[#1B2B26] border border-[#B7FF35]/30 text-xs font-mono text-[#B7FF35] flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Generate a sample test lead"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Test Lead</span>
                </button>
              </div>
            </div>

            {/* Leads Table / Card List */}
            {filteredLeads.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#0E1513] border border-white/[0.08]">
                <Users className="w-10 h-10 text-[#68736D] mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#F2F5EF]">No leads match your filter criteria</h3>
                <p className="text-xs text-[#A0AAA3] mt-1">Try clearing search or filters to see all inquiries.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-5 sm:p-6 rounded-2xl bg-[#0E1513] hover:bg-[#121A18] border border-white/[0.08] transition-all flex flex-col lg:flex-row gap-5 justify-between lg:items-center shadow-lg"
                  >
                    {/* Left: Lead Info */}
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#16201D] border border-white/10 text-xs font-mono font-bold text-[#B7FF35]">
                          #{lead.id}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase border ${getStatusBadgeColor(lead.status)}`}>
                          {lead.status}
                        </span>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          lead.urgency === 'critical'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                            : 'bg-white/5 text-[#A0AAA3] border border-white/10'
                        }`}>
                          {lead.urgency} PRIORITY
                        </span>

                        <span className="text-[11px] font-mono text-[#8C9891]">
                          {new Date(lead.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-base font-extrabold text-[#F2F5EF]">
                          {lead.name}
                        </h4>
                        <span className="text-xs text-[#8C9891]">•</span>
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-xs text-[#A0AAA3] hover:text-[#B7FF35] underline transition-colors"
                        >
                          {lead.email}
                        </a>
                      </div>

                      <div className="text-xs text-[#D1D9D4] flex flex-wrap gap-2 items-center">
                        <span className="font-mono font-semibold uppercase text-[#B7FF35] bg-[#141C19] px-2 py-0.5 rounded">
                          {lead.platform}
                        </span>
                        <span className="text-[#8C9891]">Handle:</span>
                        <strong className="text-[#F2F5EF] font-mono">{lead.accountHandle}</strong>
                        <span className="text-[#8C9891]">| Issue: {lead.banReason}</span>
                      </div>

                      <p className="text-xs text-[#A0AAA3] line-clamp-2 leading-relaxed bg-[#0A0E0D] p-2.5 rounded-lg border border-white/5">
                        "{lead.details}"
                      </p>

                      {lead.adminNotes && (
                        <div className="text-[11px] text-[#B7FF35] font-mono flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span>Internal Note: {lead.adminNotes}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Quick Action Controls */}
                    <div className="flex flex-wrap lg:flex-col items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                      {/* Status Dropdown */}
                      <div className="w-full lg:w-44">
                        <label className="block text-[10px] font-mono text-[#8C9891] uppercase mb-1">
                          Update Status
                        </label>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className="w-full px-3 py-2 bg-[#090D0D] border border-white/10 hover:border-[#B7FF35]/50 rounded-xl text-xs font-mono text-[#F2F5EF] outline-none cursor-pointer"
                        >
                          <option value="new">New Inquiry</option>
                          <option value="reviewing">In Policy Review</option>
                          <option value="appealing">Appeals Filed</option>
                          <option value="resolved">✓ Resolved / Restored</option>
                          <option value="declined">Declined</option>
                        </select>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 w-full justify-end">
                        {/* WhatsApp Client */}
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            `Hello ${lead.name}, this is Adil Afridi from META RESOLVE regarding your case inquiry #${lead.id} for ${lead.accountHandle}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-[#B7FF35] hover:bg-[#C7FF45] text-[#090D0D] transition-all shadow-md"
                          title="Message client on WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4 fill-current" />
                        </a>

                        {/* Email Client */}
                        <a
                          href={`mailto:${lead.email}?subject=${encodeURIComponent(
                            `META RESOLVE: Case #${lead.id} Update for ${lead.accountHandle}`
                          )}&body=${encodeURIComponent(
                            `Hello ${lead.name},\n\nWe have received your recovery inquiry regarding ${lead.accountHandle}.\n\nCasework Status: ${lead.status.toUpperCase()}\n\nBest regards,\nAdil Afridi\nFounder & Lead Recovery Specialist\nMETA RESOLVE`
                          )}`}
                          className="p-2 rounded-lg bg-[#141E1C] hover:bg-[#1B2B27] border border-white/10 text-[#F2F5EF] hover:text-[#B7FF35] transition-all"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>

                        {/* View / Edit Notes */}
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setCaseworkNotes(lead.adminNotes || '');
                          }}
                          className="p-2 rounded-lg bg-[#141E1C] hover:bg-[#1B2B27] border border-white/10 text-[#F2F5EF] hover:text-[#B7FF35] transition-all cursor-pointer"
                          title="View Full Case Details & Notes"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Lead */}
                        <button
                          onClick={() => handleDeleteLead(lead.id, lead.name)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: WEBSITE CONTROLS & WHATSAPP CONFIG            */}
        {/* ==================================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0E1513] border border-white/[0.08] shadow-xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.08]">
                <div className="w-10 h-10 rounded-xl bg-[#14201C] border border-[#B7FF35]/30 text-[#B7FF35] flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#F2F5EF]">Global Website Configuration</h3>
                  <p className="text-xs text-[#A0AAA3]">
                    Changes made here instantly update WhatsApp links, emergency banners, and casework indicators across the public site.
                  </p>
                </div>
              </div>

              {configSuccessMessage && (
                <div className="mb-6 p-4 rounded-xl bg-[#B7FF35]/15 border border-[#B7FF35]/40 text-[#B7FF35] text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{configSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveSiteConfig} className="space-y-6">
                {/* Official Contact Email */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#F2F5EF] mb-2">
                    Official Contact Email
                  </label>
                  <input
                    type="email"
                    value={siteConfig.officialEmail || 'metaresolveagency@proton.me'}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, officialEmail: e.target.value.trim() })
                    }
                    placeholder="metaresolveagency@proton.me"
                    required
                    className="w-full px-4 py-3 bg-[#090D0D] border border-white/10 focus:border-[#B7FF35] rounded-xl text-sm font-mono text-[#F2F5EF] outline-none"
                  />
                  <p className="text-[11px] text-[#8C9891] mt-1.5">
                    Official inbox for case submissions and client correspondence (<code className="text-[#B7FF35]">metaresolveagency@proton.me</code>).
                  </p>
                </div>

                {/* WhatsApp Digits */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#F2F5EF] mb-2">
                    Official WhatsApp Number (Raw international digits for wa.me link)
                  </label>
                  <input
                    type="text"
                    value={siteConfig.whatsappNumber}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, whatsappNumber: e.target.value.replace(/[^0-9]/g, '') })
                    }
                    placeholder="923372430274"
                    required
                    className="w-full px-4 py-3 bg-[#090D0D] border border-white/10 focus:border-[#B7FF35] rounded-xl text-sm font-mono text-[#F2F5EF] outline-none"
                  />
                  <p className="text-[11px] text-[#8C9891] mt-1.5">
                    Example: <code className="text-[#B7FF35]">923372430274</code> (Do not use '+', spaces, or dashes here).
                  </p>
                </div>

                {/* WhatsApp Display */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#F2F5EF] mb-2">
                    Display Phone Format (Visible to visitors)
                  </label>
                  <input
                    type="text"
                    value={siteConfig.whatsappDisplayNumber}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, whatsappDisplayNumber: e.target.value })
                    }
                    placeholder="+92 337 2430274"
                    required
                    className="w-full px-4 py-3 bg-[#090D0D] border border-white/10 focus:border-[#B7FF35] rounded-xl text-sm font-mono text-[#F2F5EF] outline-none"
                  />
                </div>

                {/* Founder Name */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#F2F5EF] mb-2">
                    Founder / Lead Specialist Name
                  </label>
                  <input
                    type="text"
                    value={siteConfig.founderName}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, founderName: e.target.value })
                    }
                    placeholder="Adil Afridi"
                    required
                    className="w-full px-4 py-3 bg-[#090D0D] border border-white/10 focus:border-[#B7FF35] rounded-xl text-sm text-[#F2F5EF] outline-none"
                  />
                </div>

                {/* Casework Status */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#F2F5EF] mb-2">
                    Casework Intake Queue Status
                  </label>
                  <select
                    value={siteConfig.caseworkStatus}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, caseworkStatus: e.target.value as any })
                    }
                    className="w-full px-4 py-3 bg-[#090D0D] border border-white/10 focus:border-[#B7FF35] rounded-xl text-sm font-mono text-[#F2F5EF] outline-none"
                  >
                    <option value="Open">Open — Accepting Direct Inquiries</option>
                    <option value="High Priority Only">High Priority Only — Critical Escalations</option>
                    <option value="Limited Intake">Limited Intake Queue</option>
                  </select>
                </div>

                {/* Top Announcement Banner */}
                <div className="p-4 rounded-xl bg-[#090D0D] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#B7FF35]" />
                      <span className="text-xs font-mono font-bold uppercase text-[#F2F5EF]">
                        Emergency Notice / Announcement Banner
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteConfig.bannerEnabled}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, bannerEnabled: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#182320] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B7FF35]"></div>
                    </label>
                  </div>

                  <input
                    type="text"
                    value={siteConfig.bannerAnnouncement}
                    onChange={(e) =>
                      setSiteConfig({ ...siteConfig, bannerAnnouncement: e.target.value })
                    }
                    placeholder="Priority Casework Queue Active: 24/7 Account Recovery & Direct Appeals Support"
                    className="w-full px-4 py-2.5 bg-[#121A18] border border-white/10 rounded-xl text-xs text-[#F2F5EF] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-[#B7FF35] hover:bg-[#C7FF45] text-[#090D0D] font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(183,255,53,0.3)] active:scale-[0.98] cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save & Publish Changes</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: ADMIN AUTHENTICATION & SECURITY               */}
        {/* ==================================================== */}
        {activeTab === 'security' && (
          <div className="max-w-xl space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0E1513] border border-white/[0.08] shadow-xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/[0.08]">
                <div className="w-10 h-10 rounded-xl bg-[#14201C] border border-[#B7FF35]/30 text-[#B7FF35] flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#F2F5EF]">Admin Security & Password</h3>
                  <p className="text-xs text-[#A0AAA3]">
                    Change your admin session password securely through the authenticated server API.
                  </p>
                </div>
              </div>

              {securitySuccessMessage && (
                <div className="mb-6 p-4 rounded-xl bg-[#B7FF35]/15 border border-[#B7FF35]/40 text-[#B7FF35] text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{securitySuccessMessage}</span>
                </div>
              )}

              {securityErrorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{securityErrorMessage}</span>
                </div>
              )}

              {/* Current Status Box */}
              <div className="mb-6 p-4 rounded-xl bg-[#090D0D] border border-white/5 text-xs font-mono text-[#A0AAA3] flex items-center justify-between">
                <div>
                  <span>Administrator Account: </span>
                  <strong className="text-[#B7FF35]">{currentAdminUser}</strong>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#B7FF35]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Server-Protected</span>
                </div>
              </div>

              <form onSubmit={handleUpdateCredentials} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#F2F5EF] mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    placeholder="Enter current password"
                    required
                    className="w-full px-4 py-3 bg-[#090D0D] border border-white/10 focus:border-[#B7FF35] rounded-xl text-sm text-[#F2F5EF] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#F2F5EF] mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-[#090D0D] border border-white/10 focus:border-[#B7FF35] rounded-xl text-sm text-[#F2F5EF] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-[#F2F5EF] mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-[#090D0D] border border-white/10 focus:border-[#B7FF35] rounded-xl text-sm text-[#F2F5EF] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingSecurity}
                  className="w-full py-3.5 rounded-xl bg-[#B7FF35] hover:bg-[#C7FF45] text-[#090D0D] font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(183,255,53,0.3)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isUpdatingSecurity ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </form>

              {/* Vercel & Production Environment Variable Instructions */}
              <div className="mt-8 pt-6 border-t border-white/[0.08] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F2F5EF]">
                  <Settings className="w-4 h-4 text-[#B7FF35]" />
                  <span>Vercel & Cloud Environment Configuration</span>
                </div>
                <p className="text-[11px] text-[#A0AAA3] leading-relaxed">
                  For permanent, tamper-proof credential storage across Vercel, Cloud Run, and production builds, set these environment variables in your deployment dashboard:
                </p>
                <div className="p-3.5 rounded-xl bg-[#070B0A] border border-white/5 font-mono text-[11px] space-y-1.5">
                  <div className="text-[#8C9891]"># Vercel Project Settings &gt; Environment Variables</div>
                  <div className="text-[#B7FF35] font-semibold">ADMIN_USERNAME=metaresolve</div>
                  <div className="text-[#B7FF35] font-semibold">ADMIN_PASSWORD=your_secure_password</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ==================================================== */}
      {/* MODAL: CASE DETAILS & INTERNAL NOTES                 */}
      {/* ==================================================== */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#0E1513] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedLead(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-[#141C19] text-[#A0AAA3] hover:text-[#F2F5EF] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-md bg-[#16201D] border border-white/10 text-xs font-mono font-bold text-[#B7FF35]">
                  Case #{selectedLead.id}
                </span>
                <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase border ${getStatusBadgeColor(selectedLead.status)}`}>
                  {selectedLead.status}
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-[#F2F5EF] mb-1">
                {selectedLead.name}
              </h2>
              <p className="text-xs text-[#A0AAA3] mb-6">
                Submitted on {new Date(selectedLead.createdAt).toLocaleString()}
              </p>

              {/* Grid of Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
                <div className="p-3.5 rounded-xl bg-[#090D0D] border border-white/5">
                  <span className="text-[#8C9891] block mb-1">Client Email</span>
                  <a href={`mailto:${selectedLead.email}`} className="text-[#B7FF35] font-mono font-semibold">
                    {selectedLead.email}
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-[#090D0D] border border-white/5">
                  <span className="text-[#8C9891] block mb-1">Platform & Account Type</span>
                  <span className="text-[#F2F5EF] font-bold uppercase">
                    {selectedLead.platform} — {selectedLead.accountType}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#090D0D] border border-white/5">
                  <span className="text-[#8C9891] block mb-1">Account Handle / URL</span>
                  <span className="text-[#F2F5EF] font-mono font-bold">
                    {selectedLead.accountHandle}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#090D0D] border border-white/5">
                  <span className="text-[#8C9891] block mb-1">Violation / Ban Reason</span>
                  <span className="text-[#F2F5EF] font-semibold">
                    {selectedLead.banReason}
                  </span>
                </div>
              </div>

              {/* Full Description */}
              <div className="mb-6">
                <label className="block text-xs font-mono text-[#8C9891] uppercase mb-2">
                  Client Problem Description
                </label>
                <div className="p-4 rounded-xl bg-[#090D0D] border border-white/5 text-xs text-[#D1D9D4] leading-relaxed">
                  {selectedLead.details}
                </div>
              </div>

              {/* Casework Notes Editor */}
              <div className="mb-6">
                <label className="block text-xs font-mono text-[#8C9891] uppercase mb-2">
                  Internal Casework Notes (Admin Only)
                </label>
                <textarea
                  rows={4}
                  value={caseworkNotes}
                  onChange={(e) => setCaseworkNotes(e.target.value)}
                  placeholder="Record appeal tickets, Meta concierge agent responses, or verification documents ready..."
                  className="w-full p-3.5 bg-[#090D0D] border border-white/10 focus:border-[#B7FF35] rounded-xl text-xs text-[#F2F5EF] outline-none"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
                <button
                  onClick={handleSaveNotes}
                  className="px-5 py-2.5 rounded-xl bg-[#B7FF35] hover:bg-[#C7FF45] text-[#090D0D] font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Save Internal Notes
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Hello ${selectedLead.name}, this is Adil Afridi from META RESOLVE regarding your case inquiry #${selectedLead.id}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#15201C] hover:bg-[#1C2C27] border border-[#B7FF35]/40 text-[#B7FF35] text-xs font-bold flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp Client</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
