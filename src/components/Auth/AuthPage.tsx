/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';
import { AuthUser } from '../../types';
import {
  loginWithEmail,
  signupWithEmail,
  requestPasswordReset,
  resetPasswordWithToken,
  setStoredSession
} from '../../utils/userAuth';

interface AuthPageProps {
  onAuthSuccess: (user: AuthUser) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot_password';

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Password reset specific
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSubmitted, setResetSubmitted] = useState(false);
  const [showResetNewPasswordInput, setShowResetNewPasswordInput] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [googleInfoModal, setGoogleInfoModal] = useState<string | null>(null);

  // Listen for OAuth postMessage callbacks from Google popup
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      // Validate origin
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { token, user } = event.data;
        if (token && user) {
          setStoredSession(token, user, true);
          setIsGoogleLoading(false);
          onAuthSuccess(user);
        }
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setIsGoogleLoading(false);
        setErrorMessage(event.data.error || 'Google authentication encountered an error.');
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [onAuthSuccess]);

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  // Handle email login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithEmail(email, password, rememberMe);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Invalid credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email signup
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signupWithEmail(name, email, password, rememberMe);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Account creation failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password request
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setResetSubmitted(true);
        setSuccessMessage('Password reset instructions and verification code have been generated.');
        if (res.resetCode) {
          setResetCode(res.resetCode);
          setShowResetNewPasswordInput(true);
        }
      } else {
        setErrorMessage(res.error || 'Failed to process password reset.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset password confirmation
  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!resetCode.trim()) {
      setErrorMessage('Please enter your reset code or recovery token.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordWithToken(resetCode.trim(), newPassword);
      if (res.success) {
        setSuccessMessage('Password successfully updated! You can now sign in.');
        setTimeout(() => {
          setMode('login');
          setResetSubmitted(false);
          setShowResetNewPasswordInput(false);
          setPassword('');
        }, 1500);
      } else {
        setErrorMessage(res.error || 'Failed to reset password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth button handler using real popup flow
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);

    try {
      const res = await fetch('/api/user-auth/google/url');
      const data = await res.json();

      if (!res.ok || !data.configured || !data.url) {
        // If Google OAuth Client ID isn't configured in server env, prompt clear guidance
        setGoogleInfoModal(
          data.error || 'Google OAuth Client ID is not configured yet. You can sign in using Email & Password, or set GOOGLE_CLIENT_ID in your Cloud Run / environment variables.'
        );
        setIsGoogleLoading(false);
        return;
      }

      // Open OAuth provider URL directly in popup per oauth-integration guidelines
      const popup = window.open(
        data.url,
        'metaresolve_google_oauth',
        'width=550,height=650,left=200,top=100'
      );

      if (!popup) {
        setErrorMessage('Popup was blocked by your browser. Please allow popups for Google authentication.');
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setErrorMessage('Failed to initiate Google authentication. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D0D] text-[#F2F5EF] flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#B7FF35]/[0.04] blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[350px] bg-[#00E5FF]/[0.02] blur-[150px] pointer-events-none rounded-full" />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #B7FF35 1px, transparent 1px), linear-gradient(to bottom, #B7FF35 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Header bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#141B19] border border-[#B7FF35]/30 flex items-center justify-center shadow-[0_0_20px_rgba(183,255,53,0.12)]">
            <ShieldCheck className="w-5 h-5 text-[#B7FF35]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-[#F2F5EF] flex items-center font-display">
              META<span className="text-[#B7FF35] ml-1">RESOLVE</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#68736D] font-mono -mt-0.5">
              ACCOUNT RECOVERY LABS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-[#8C9891] bg-[#141A19]/60 border border-white/[0.08] px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF35] animate-pulse" />
          <span>SECURE SYSTEM ACCESS</span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 my-auto py-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#141A19] border border-white/[0.09] rounded-3xl p-7 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl relative"
        >
          {/* Top highlight glow */}
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#B7FF35]/60 to-transparent" />

          {/* Alert / Feedback message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 font-sans leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-[#B7FF35]/10 border border-[#B7FF35]/30 text-[#D4FF7D] text-xs flex items-start gap-2.5 font-sans leading-relaxed"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#B7FF35] mt-0.5" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {/* VIEW: LOGIN */}
          {mode === 'login' && (
            <div>
              <div className="text-center mb-7">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F2F5EF] tracking-tight font-display mb-2">
                  Welcome to META RESOLVE
                </h1>
                <p className="text-xs sm:text-sm text-[#9AA49E] leading-relaxed">
                  Sign in to continue and manage your account.
                </p>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#D1DDD6] mb-1.5 uppercase tracking-wider">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736D]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 bg-[#0E1513] border border-white/[0.08] focus:border-[#B7FF35] focus:ring-1 focus:ring-[#B7FF35] rounded-xl text-sm text-[#F2F5EF] placeholder-[#57625B] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono text-[#D1DDD6] uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs text-[#B7FF35] hover:text-[#C7FF45] font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736D]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-11 py-3 bg-[#0E1513] border border-white/[0.08] focus:border-[#B7FF35] focus:ring-1 focus:ring-[#B7FF35] rounded-xl text-sm text-[#F2F5EF] placeholder-[#57625B] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#68736D] hover:text-[#D1DDD6] transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me checkbox */}
                <div className="flex items-center pt-1 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#9AA49E] select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#0E1513] border-white/20 text-[#B7FF35] focus:ring-[#B7FF35] accent-[#B7FF35]"
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-xl text-sm uppercase tracking-wider font-bold text-[#090D0D] bg-[#B7FF35] hover:bg-[#C7FF45] active:scale-[0.99] transition-all shadow-lg shadow-[#B7FF35]/20 hover:shadow-[#B7FF35]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  id="btn-sign-in-primary"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#090D0D] border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* OR Divider */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-x-0 h-px bg-white/[0.08]" />
                <span className="relative z-10 px-3 bg-[#141A19] text-[11px] font-mono uppercase text-[#68736D]">
                  OR
                </span>
              </div>

              {/* Continue with Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-3 px-5 rounded-xl text-sm font-semibold text-[#F2F5EF] bg-[#0E1513] hover:bg-[#182320] border border-white/[0.12] hover:border-[#B7FF35]/40 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm disabled:opacity-60"
                id="btn-google-sign-in"
              >
                {/* Official Google 'G' multicolored SVG icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{isGoogleLoading ? 'Connecting with Google...' : 'Continue with Google'}</span>
              </button>

              {/* Don't have an account switch */}
              <div className="mt-7 text-center">
                <p className="text-xs text-[#9AA49E]">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[#B7FF35] hover:text-[#C7FF45] font-semibold underline underline-offset-4 cursor-pointer transition-colors"
                  >
                    Create one
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* VIEW: SIGN UP */}
          {mode === 'signup' && (
            <div>
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F2F5EF] tracking-tight font-display mb-2">
                  Create Account
                </h1>
                <p className="text-xs sm:text-sm text-[#9AA49E] leading-relaxed">
                  Join META RESOLVE to manage your recovery casework.
                </p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono text-[#D1DDD6] mb-1 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736D]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0E1513] border border-white/[0.08] focus:border-[#B7FF35] focus:ring-1 focus:ring-[#B7FF35] rounded-xl text-sm text-[#F2F5EF] placeholder-[#57625B] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#D1DDD6] mb-1 uppercase tracking-wider">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736D]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0E1513] border border-white/[0.08] focus:border-[#B7FF35] focus:ring-1 focus:ring-[#B7FF35] rounded-xl text-sm text-[#F2F5EF] placeholder-[#57625B] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#D1DDD6] mb-1 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736D]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create password (min 8 chars)"
                      className="w-full pl-10 pr-11 py-2.5 bg-[#0E1513] border border-white/[0.08] focus:border-[#B7FF35] focus:ring-1 focus:ring-[#B7FF35] rounded-xl text-sm text-[#F2F5EF] placeholder-[#57625B] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#68736D] hover:text-[#D1DDD6] transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#D1DDD6] mb-1 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736D]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full pl-10 pr-11 py-2.5 bg-[#0E1513] border border-white/[0.08] focus:border-[#B7FF35] focus:ring-1 focus:ring-[#B7FF35] rounded-xl text-sm text-[#F2F5EF] placeholder-[#57625B] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#68736D] hover:text-[#D1DDD6] transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Primary Create Account Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 px-6 rounded-xl text-sm uppercase tracking-wider font-bold text-[#090D0D] bg-[#B7FF35] hover:bg-[#C7FF45] active:scale-[0.99] transition-all shadow-lg shadow-[#B7FF35]/20 hover:shadow-[#B7FF35]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  id="btn-create-account-primary"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#090D0D] border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* OR Divider */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-x-0 h-px bg-white/[0.08]" />
                <span className="relative z-10 px-3 bg-[#141A19] text-[11px] font-mono uppercase text-[#68736D]">
                  OR
                </span>
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-3 px-5 rounded-xl text-sm font-semibold text-[#F2F5EF] bg-[#0E1513] hover:bg-[#182320] border border-white/[0.12] hover:border-[#B7FF35]/40 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Already have an account switch */}
              <div className="mt-6 text-center">
                <p className="text-xs text-[#9AA49E]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[#B7FF35] hover:text-[#C7FF45] font-semibold underline underline-offset-4 cursor-pointer transition-colors"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* VIEW: PASSWORD RECOVERY */}
          {mode === 'forgot_password' && (
            <div>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#17221E] border border-[#B7FF35]/30 flex items-center justify-center mx-auto mb-3 text-[#B7FF35]">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F2F5EF] tracking-tight font-display mb-1.5">
                  Reset your password
                </h1>
                <p className="text-xs sm:text-sm text-[#9AA49E] leading-relaxed">
                  Enter your email address to receive password reset instructions.
                </p>
              </div>

              {!showResetNewPasswordInput ? (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-[#D1DDD6] mb-1.5 uppercase tracking-wider">
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736D]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-4 py-3 bg-[#0E1513] border border-white/[0.08] focus:border-[#B7FF35] focus:ring-1 focus:ring-[#B7FF35] rounded-xl text-sm text-[#F2F5EF] placeholder-[#57625B] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-xl text-sm uppercase tracking-wider font-bold text-[#090D0D] bg-[#B7FF35] hover:bg-[#C7FF45] transition-all shadow-lg shadow-[#B7FF35]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#090D0D] border-t-transparent rounded-full animate-spin" />
                        Sending Reset Link...
                      </span>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-[#D1DDD6] mb-1.5 uppercase tracking-wider">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="6-digit reset code"
                      className="w-full px-4 py-3 bg-[#0E1513] border border-white/[0.08] focus:border-[#B7FF35] focus:ring-1 focus:ring-[#B7FF35] rounded-xl text-sm text-[#F2F5EF] placeholder-[#57625B] outline-none transition-all text-center tracking-widest font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-[#D1DDD6] mb-1.5 uppercase tracking-wider">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 chars)"
                      className="w-full px-4 py-3 bg-[#0E1513] border border-white/[0.08] focus:border-[#B7FF35] focus:ring-1 focus:ring-[#B7FF35] rounded-xl text-sm text-[#F2F5EF] placeholder-[#57625B] outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-6 rounded-xl text-sm uppercase tracking-wider font-bold text-[#090D0D] bg-[#B7FF35] hover:bg-[#C7FF45] transition-all shadow-lg shadow-[#B7FF35]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? 'Updating Password...' : 'Save New Password & Sign In'}
                  </button>
                </form>
              )}

              {/* Back to Sign In */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs text-[#D1DDD6] hover:text-[#B7FF35] transition-colors cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}

        </motion.div>

        {/* Demo Account Quick Access Notice */}
        <div className="mt-5 text-center">
          <p className="text-[11px] font-mono text-[#68736D]">
            META RESOLVE Secure Client Portal • 256-bit Encrypted
          </p>
        </div>

      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-[#57625B] font-mono">
        © {new Date().getFullYear()} META RESOLVE. All rights reserved. Strictly confidential client casework.
      </footer>

      {/* Google Setup Guide / Informational Modal if client_id is not yet injected */}
      {googleInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#141B19] border border-[#B7FF35]/40 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
          >
            <div className="flex items-center gap-2.5 text-[#B7FF35] mb-3">
              <Info className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-base text-[#F2F5EF]">Google Authentication</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#A0AAA3] leading-relaxed mb-4">
              {googleInfoModal}
            </p>
            <div className="bg-[#0E1513] border border-white/10 rounded-xl p-3 mb-5 text-[11px] font-mono text-[#D1DDD6] space-y-1">
              <div>To enable Google OAuth:</div>
              <div className="text-[#B7FF35]">1. Create an OAuth 2.0 Client ID in Google Cloud</div>
              <div className="text-[#B7FF35]">2. Set GOOGLE_CLIENT_ID &amp; GOOGLE_CLIENT_SECRET</div>
              <div className="text-[#9AA49E]">Or continue using Email &amp; Password authentication.</div>
            </div>
            <button
              onClick={() => setGoogleInfoModal(null)}
              className="w-full py-2.5 bg-[#B7FF35] hover:bg-[#C7FF45] text-[#090D0D] font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Understood
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
};
