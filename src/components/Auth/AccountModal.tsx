/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Shield,
  Key,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Mail,
  Lock,
  Sparkles
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
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword.length < 8) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsUpdating(true);
    try {
      // Use forgot-password + reset flow internally for user account
      const res = await fetch('/api/user-auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email })
      });
      const data = await res.json();
      if (data.resetCode) {
        const updateRes = await fetch('/api/user-auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokenOrCode: data.resetCode, newPassword })
        });
        if (updateRes.ok) {
          setStatusMessage({ type: 'success', text: 'Password has been updated successfully.' });
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setStatusMessage({ type: 'error', text: 'Failed to update password.' });
        }
      } else {
        setStatusMessage({ type: 'error', text: 'Could not update password at this time.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error updating credentials.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const userInitial = currentUser.name.trim().charAt(0).toUpperCase() || 'U';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#141B19] border border-white/[0.12] rounded-3xl overflow-hidden shadow-2xl relative text-[#F2F5EF]"
      >
        {/* Top green accent border */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#B7FF35] to-transparent" />

        {/* Modal Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#86D416] via-[#B7FF35] to-[#467320]">
              <div className="w-full h-full rounded-full bg-[#0A0F0E] flex items-center justify-center font-display font-bold text-[#B7FF35]">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  userInitial
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F2F5EF] leading-tight font-display">
                {currentUser.name}
              </h3>
              <p className="text-xs text-[#8C9891] font-mono">
                {currentUser.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#0E1513] border border-white/10 hover:border-white/20 text-[#A0AAA3] hover:text-[#F2F5EF] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex items-center gap-4 border-b border-white/[0.06]">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
              activeTab === 'profile' ? 'text-[#B7FF35]' : 'text-[#8C9891] hover:text-[#D1DDD6]'
            }`}
          >
            Account Details
            {activeTab === 'profile' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#B7FF35]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
              activeTab === 'security' ? 'text-[#B7FF35]' : 'text-[#8C9891] hover:text-[#D1DDD6]'
            }`}
          >
            Security &amp; Password
            {activeTab === 'security' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#B7FF35]" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {statusMessage && (
            <div
              className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2.5 font-sans ${
                statusMessage.type === 'success'
                  ? 'bg-[#B7FF35]/10 border border-[#B7FF35]/30 text-[#D4FF7D]'
                  : 'bg-red-500/10 border border-red-500/30 text-red-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#B7FF35] mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-[#0E1513] rounded-2xl p-4 border border-white/[0.06] space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="text-[#8C9891] font-mono">Account ID</span>
                  <span className="font-mono text-[#D1DDD6] font-semibold">{currentUser.id}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="text-[#8C9891] font-mono">Authentication Type</span>
                  <span className="font-mono uppercase text-[#B7FF35] font-semibold">
                    {currentUser.authProvider}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="text-[#8C9891] font-mono">Account Status</span>
                  <span className="inline-flex items-center gap-1.5 text-[#B7FF35]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF35] animate-pulse" />
                    Verified Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8C9891] font-mono">Casework Portal</span>
                  <span className="text-[#D1DDD6]">Priority Client Queue</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#17221E] border border-[#B7FF35]/25 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#F2F5EF]">Dedicated Casework Specialist</div>
                  <div className="text-[11px] text-[#8C9891]">Direct access to Adil Afridi &amp; Huzaifa</div>
                </div>
                <Sparkles className="w-4 h-4 text-[#B7FF35]" />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              {currentUser.authProvider === 'google' ? (
                <div className="bg-[#0E1513] rounded-2xl p-5 border border-white/[0.06] text-center">
                  <div className="w-10 h-10 rounded-full bg-[#182320] border border-[#B7FF35]/30 flex items-center justify-center mx-auto mb-2 text-[#B7FF35]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#F2F5EF] mb-1">Google OAuth Authentication</h4>
                  <p className="text-xs text-[#8C9891] leading-relaxed">
                    Your account is securely authenticated through Google OAuth. Password management is managed directly by Google Security.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-mono text-[#D1DDD6] mb-1 uppercase tracking-wider">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full px-3.5 py-2.5 bg-[#0E1513] border border-white/[0.08] focus:border-[#B7FF35] rounded-xl text-sm text-[#F2F5EF] placeholder-[#57625B] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#D1DDD6] mb-1 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2.5 bg-[#0E1513] border border-white/[0.08] focus:border-[#B7FF35] rounded-xl text-sm text-[#F2F5EF] placeholder-[#57625B] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-3 px-4 rounded-xl text-xs uppercase tracking-wider font-bold text-[#090D0D] bg-[#B7FF35] hover:bg-[#C7FF45] transition-all shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {isUpdating ? 'Updating Password...' : 'Save New Password'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 pt-3 border-t border-white/[0.08] flex items-center justify-between bg-[#0E1513]/40">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex items-center gap-2 text-xs font-mono text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out of META RESOLVE</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#182320] hover:bg-[#1E2B27] border border-white/10 text-xs font-mono text-[#D1DDD6] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </motion.div>
    </div>
  );
};
