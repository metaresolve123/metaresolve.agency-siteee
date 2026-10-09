/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Mail,
  ShieldCheck,
  LogOut,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { AuthUser } from '../../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  onLogout: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{
    loading: boolean;
    error: string;
    success: string;
  }>({ loading: false, error: '', success: '' });

  if (!isOpen) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, error: '', success: '' });

    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus({
        loading: false,
        error: 'New password must be at least 6 characters long.',
        success: ''
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordStatus({
        loading: false,
        error: 'Passwords do not match.',
        success: ''
      });
      return;
    }

    try {
      // Direct reset request using current session email
      const res = await fetch('/api/user-auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email })
      });
      const data = await res.json();

      if (data.resetToken) {
        const updateRes = await fetch('/api/user-auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: data.resetToken,
            newPassword,
            confirmPassword: confirmNewPassword
          })
        });
        const updateData = await updateRes.json();
        if (updateData.success) {
          setPasswordStatus({
            loading: false,
            error: '',
            success: 'Password successfully updated!'
          });
          setNewPassword('');
          setConfirmNewPassword('');
          setCurrentPassword('');
          return;
        }
      }

      setPasswordStatus({
        loading: false,
        error: '',
        success: 'Password reset link sent to your registered email address.'
      });
    } catch (err: any) {
      setPasswordStatus({
        loading: false,
        error: err?.message || 'Failed to update password.',
        success: ''
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg bg-[#141A19] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
      >
        {/* Top Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B211F] border border-[#B7FF35]/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#B7FF35]" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#F2F5EF] font-display">
                Client Account Portal
              </h3>
              <p className="text-xs text-[#9AA49E] font-mono">
                ID: {currentUser.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9AA49E] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/[0.08] px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#B7FF35] text-[#B7FF35]'
                : 'border-transparent text-[#9AA49E] hover:text-[#D1DDD6]'
            }`}
          >
            Account Details
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'password'
                ? 'border-[#B7FF35] text-[#B7FF35]'
                : 'border-transparent text-[#9AA49E] hover:text-[#D1DDD6]'
            }`}
          >
            Security &amp; Password
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#1B211F] border border-white/[0.06] flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#141A19] border border-[#B7FF35]/40 flex items-center justify-center font-bold text-xl text-[#B7FF35]">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    currentUser.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base text-[#F2F5EF] truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-[#9AA49E] font-mono truncate">
                    {currentUser.email}
                  </div>
                  <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-md bg-[#B7FF35]/15 text-[#B7FF35] text-[10px] font-mono font-bold uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF35]" />
                    <span>Verified Session Active</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-2 border-b border-white/[0.06]">
                  <span className="text-[#9AA49E]">Auth Method</span>
                  <span className="font-mono text-[#F2F5EF] uppercase">
                    {currentUser.authProvider}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.06]">
                  <span className="text-[#9AA49E]">Registered</span>
                  <span className="font-mono text-[#F2F5EF]">
                    {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.06]">
                  <span className="text-[#9AA49E]">Service Tier</span>
                  <span className="font-mono text-[#B7FF35]">Priority Client</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Session</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#1B211F] hover:bg-[#222B28] border border-white/10 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordStatus.error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordStatus.error}</span>
                </div>
              )}
              {passwordStatus.success && (
                <div className="p-3 rounded-xl bg-[#B7FF35]/15 border border-[#B7FF35]/40 text-[#B7FF35] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passwordStatus.success}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#D1DDD6] mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-[#1B211F] border border-white/[0.1] focus:border-[#B7FF35] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-[#52635B] focus:outline-none focus:ring-1 focus:ring-[#B7FF35]/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D1DDD6] mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-[#1B211F] border border-white/[0.1] focus:border-[#B7FF35] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-[#52635B] focus:outline-none focus:ring-1 focus:ring-[#B7FF35]/40 transition-all"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-[#1B211F] hover:bg-[#222B28] border border-white/10 text-[#9AA49E] text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordStatus.loading}
                  className="px-5 py-2.5 rounded-xl bg-[#B7FF35] hover:bg-[#C8FF52] text-[#090D0D] font-bold text-xs transition-colors cursor-pointer disabled:opacity-80"
                >
                  {passwordStatus.loading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </span>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
