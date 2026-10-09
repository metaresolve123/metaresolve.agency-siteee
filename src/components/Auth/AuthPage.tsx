/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sparkles,
  ArrowLeft,
  Info
} from 'lucide-react';
import { AuthUser } from '../../types';
import {
  loginWithEmail,
  signupWithEmail,
  requestPasswordReset,
  getGoogleAuthUrl
} from '../../utils/userAuth';

interface AuthPageProps {
  onAuthSuccess: (user: AuthUser) => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onAuthSuccess,
  initialMode = 'signin'
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign In form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Forgot Password form state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [resetErrorMessage, setResetErrorMessage] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  // General loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Google OAuth guidance modal state
  const [googleStatusModal, setGoogleStatusModal] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({ show: false, title: '', message: '' });

  // Handle URL parameters for OAuth callbacks or errors
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('auth_error');
    if (authError) {
      setErrorMessage(`Authentication error: ${decodeURIComponent(authError)}`);
      // Clean query parameter without reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Quick autofill for verified test demo credentials
  const handleAutofillDemo = () => {
    setMode('signin');
    setSignInEmail('client@metaresolve.com');
    setSignInPassword('MetaClient2026!');
    setErrorMessage('');
  };

  // Sign In submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signInEmail.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!signInPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithEmail(signInEmail.trim(), signInPassword, rememberMe);
      if (res.success && res.user) {
        setSuccessMessage('Authentication successful. Redirecting to META RESOLVE...');
        setTimeout(() => {
          onAuthSuccess(res.user!);
        }, 400);
      } else {
        setErrorMessage(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to connect to authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signUpName.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service & Privacy Policy.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signupWithEmail(
        signUpName.trim(),
        signUpEmail.trim(),
        signUpPassword,
        rememberMe
      );
      if (res.success && res.user) {
        setSuccessMessage('Account created successfully! Entering META RESOLVE...');
        setTimeout(() => {
          onAuthSuccess(res.user!);
        }, 400);
      } else {
        setErrorMessage(res.error || 'Could not complete registration.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to connect to registration service.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Flow
  const handleGoogleAuth = async () => {
    setErrorMessage('');
    setIsLoading(true);

    try {
      const data = await getGoogleAuthUrl();
      if (data.success && data.configured && data.url) {
        // Redirect to official Google OAuth consent screen
        window.location.href = data.url;
      } else {
        setIsLoading(false);
        setGoogleStatusModal({
          show: true,
          title: 'Google OAuth Setup Notice',
          message:
            data.error ||
            'Google OAuth credentials (GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET) are not configured in your environment variables yet. You can sign in immediately using Email & Password or the demo account.'
        });
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Failed to initiate Google authentication.');
    }
  };

  // Forgot Password request
  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMessage('');
    setResetSuccessMessage('');

    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setResetErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsResetLoading(true);
    try {
      const res = await requestPasswordReset(resetEmail.trim());
      if (res.success) {
        setResetSuccessMessage(
          res.message ||
            'A password reset link has been dispatched to your email address.'
        );
      } else {
        setResetErrorMessage(res.error || 'Failed to dispatch password reset link.');
      }
    } catch (err: any) {
      setResetErrorMessage(err?.message || 'Network error requesting password reset.');
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D0D] text-[#F2F5EF] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden select-none">
      
      {/* Ambient background lighting and grid */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft neon-lime ambient glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#B7FF35]/[0.06] rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#5EE7B7]/[0.05] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#B7FF35]/[0.03] rounded-full blur-[160px]" />

        {/* Subtle grid pattern */}
        <div
          className="w-full h-full opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #B7FF35 1px, transparent 1px), linear-gradient(to bottom, #B7FF35 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />
      </div>

      {/* Top Brand Header */}
      <div className="relative z-20 mb-6 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#141A19]/80 border border-white/[0.08] backdrop-blur-md mb-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[#B7FF35] animate-pulse" />
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#9AA49E]">
            SECURE CLIENT AUTHENTICATION
          </span>
        </div>
      </div>

      {/* Quick Demo Credentials Assistant Banner */}
      <div className="relative z-20 mb-4 max-w-xl w-full">
        <div className="bg-[#141A19]/90 border border-[#B7FF35]/25 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-[0_0_20px_rgba(183,255,53,0.06)] text-xs">
          <div className="flex items-center gap-2 text-[#9AA49E]">
            <Sparkles className="w-4 h-4 text-[#B7FF35] shrink-0" />
            <span>
              Instant Demo Access:{' '}
              <strong className="text-[#F2F5EF] font-mono">client@metaresolve.com</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleAutofillDemo}
            className="px-2.5 py-1 rounded-lg bg-[#B7FF35]/15 hover:bg-[#B7FF35]/25 border border-[#B7FF35]/40 text-[#B7FF35] font-mono text-[11px] font-bold transition-all cursor-pointer"
          >
            Autofill Credentials
          </button>
        </div>
      </div>

      {/* MAIN AUTHENTICATION CONTAINER (Split-Screen Sliding Card) */}
      <div className="relative z-20 w-full max-w-[960px] min-h-[600px] bg-[#141A19] border border-white/[0.08] rounded-3xl shadow-[0_0_70px_rgba(0,0,0,0.8),0_0_40px_rgba(183,255,53,0.08)] overflow-hidden flex flex-col md:flex-row">
        
        {/* Subtle top neon accent line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#B7FF35]/70 to-transparent" />

        {/* =========================================================================
            DESKTOP SLIDING VIEWPORT:
            When mode === 'signin':
              - Left Side (50%): Sign In Form
              - Right Side (50%): Welcome Overlay ("Hello, Friend!")
            When mode === 'signup':
              - Left Side (50%): Welcome Overlay ("Welcome Back!")
              - Right Side (50%): Sign Up Form ("Create Your Account")
           ========================================================================= */}

        {/* FORMS WRAPPER (Occupies full container width on desktop, 2 halves) */}
        <div className="w-full flex flex-col md:flex-row relative">

          {/* SIGN IN FORM PANEL (Left Half on Desktop) */}
          <div
            className={`w-full md:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center transition-all duration-500 ${
              mode === 'signup' ? 'md:opacity-0 pointer-events-none hidden md:flex' : 'flex'
            }`}
          >
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#1B211F] border border-[#B7FF35]/40 flex items-center justify-center shadow-[0_0_15px_rgba(183,255,53,0.2)]">
                <ShieldCheck className="w-5 h-5 text-[#B7FF35]" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-[#F2F5EF]">
                META <span className="text-[#B7FF35]">RESOLVE</span>
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F2F5EF] font-display tracking-tight">
                Welcome Back
              </h2>
              <p className="text-sm text-[#9AA49E] mt-1 font-sans">
                Sign in to continue to META RESOLVE.
              </p>
            </div>

            {/* Error / Success Notifications */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-[#B7FF35]/15 border border-[#B7FF35]/40 text-[#B7FF35] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#1B211F] hover:bg-[#222B28] border border-white/[0.1] hover:border-white/[0.2] text-[#F2F5EF] font-medium text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm group active:scale-[0.99] mb-5"
              id="google-auth-button-signin"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.9.7 5.5 1.9 7.9l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-white/[0.08] w-full" />
              <span className="bg-[#141A19] px-3 text-[11px] font-mono text-[#68736D] uppercase">
                or with email
              </span>
              <div className="border-t border-white/[0.08] w-full" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#D1DDD6] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736D]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#1B211F] border border-white/[0.1] focus:border-[#B7FF35] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#52635B] focus:outline-none focus:ring-1 focus:ring-[#B7FF35]/40 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D1DDD6] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736D]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#1B211F] border border-white/[0.1] focus:border-[#B7FF35] rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-[#52635B] focus:outline-none focus:ring-1 focus:ring-[#B7FF35]/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#68736D] hover:text-[#D1DDD6] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#9AA49E] hover:text-[#D1DDD6]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#1B211F] border-white/20 text-[#B7FF35] focus:ring-0 cursor-pointer accent-[#B7FF35]"
                  />
                  <span>Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-[#B7FF35] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#A3F226] via-[#B7FF35] to-[#C8FF52] hover:from-[#B7FF35] hover:to-[#D5FF6E] text-[#090D0D] font-bold text-sm py-3.5 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(183,255,53,0.3)] hover:shadow-[0_0_30px_rgba(183,255,53,0.45)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80 active:scale-[0.99] mt-2"
                id="email-signin-submit-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Mobile Toggle Footer */}
            <div className="mt-6 text-center text-xs text-[#9AA49E] md:hidden">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#B7FF35] font-bold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* SIGN UP FORM PANEL (Right Half on Desktop) */}
          <div
            className={`w-full md:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center transition-all duration-500 ${
              mode === 'signin' ? 'md:opacity-0 pointer-events-none hidden md:flex' : 'flex'
            }`}
          >
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#1B211F] border border-[#B7FF35]/40 flex items-center justify-center shadow-[0_0_15px_rgba(183,255,53,0.2)]">
                <ShieldCheck className="w-5 h-5 text-[#B7FF35]" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-[#F2F5EF]">
                META <span className="text-[#B7FF35]">RESOLVE</span>
              </span>
            </div>

            <div className="mb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F2F5EF] font-display tracking-tight">
                Create Your Account
              </h2>
              <p className="text-sm text-[#9AA49E] mt-1 font-sans">
                Create your META RESOLVE account to get started.
              </p>
            </div>

            {/* Error / Success Notifications */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-[#B7FF35]/15 border border-[#B7FF35]/40 text-[#B7FF35] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google Sign-up Option */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1B211F] hover:bg-[#222B28] border border-white/[0.1] hover:border-white/[0.2] text-[#F2F5EF] font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm mb-4 active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.9.7 5.5 1.9 7.9l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                />
              </svg>
              <span>Sign up with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-white/[0.08] w-full" />
              <span className="bg-[#141A19] px-3 text-[10px] font-mono text-[#68736D] uppercase">
                or registration details
              </span>
              <div className="border-t border-white/[0.08] w-full" />
            </div>

            {/* Sign Up Form Fields */}
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#D1DDD6] mb-1">
                  Full Name <span className="text-[#B7FF35]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736D]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-[#1B211F] border border-white/[0.1] focus:border-[#B7FF35] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[#52635B] focus:outline-none focus:ring-1 focus:ring-[#B7FF35]/40 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#D1DDD6] mb-1">
                  Email Address <span className="text-[#B7FF35]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736D]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#1B211F] border border-white/[0.1] focus:border-[#B7FF35] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[#52635B] focus:outline-none focus:ring-1 focus:ring-[#B7FF35]/40 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#D1DDD6] mb-1">
                    Password <span className="text-[#B7FF35]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full bg-[#1B211F] border border-white/[0.1] focus:border-[#B7FF35] rounded-xl pl-3.5 pr-9 py-2.5 text-sm text-white placeholder:text-[#52635B] focus:outline-none focus:ring-1 focus:ring-[#B7FF35]/40 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#68736D] hover:text-[#D1DDD6]"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#D1DDD6] mb-1">
                    Confirm Password <span className="text-[#B7FF35]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-[#1B211F] border border-white/[0.1] focus:border-[#B7FF35] rounded-xl pl-3.5 pr-9 py-2.5 text-sm text-white placeholder:text-[#52635B] focus:outline-none focus:ring-1 focus:ring-[#B7FF35]/40 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#68736D] hover:text-[#D1DDD6]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms and Privacy Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#9AA49E]">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded bg-[#1B211F] border-white/20 text-[#B7FF35] focus:ring-0 cursor-pointer accent-[#B7FF35] shrink-0"
                  />
                  <span>
                    I agree to the{' '}
                    <span className="text-[#D1DDD6] underline">Terms of Service</span> and{' '}
                    <span className="text-[#D1DDD6] underline">Privacy Policy</span>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#A3F226] via-[#B7FF35] to-[#C8FF52] hover:from-[#B7FF35] hover:to-[#D5FF6E] text-[#090D0D] font-bold text-sm py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(183,255,53,0.3)] hover:shadow-[0_0_30px_rgba(183,255,53,0.45)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80 active:scale-[0.99] mt-3"
                id="email-signup-submit-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>CREATE ACCOUNT</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Mobile Toggle Footer */}
            <div className="mt-5 text-center text-xs text-[#9AA49E] md:hidden">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-[#B7FF35] font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>

        </div>

        {/* =========================================================================
            ANIMATED WELCOME OVERLAY PANEL (DESKTOP ONLY)
            Inspired by the reference screenshot:
            When mode === 'signin' => positioned on RIGHT (x: '100%')
            When mode === 'signup' => slides to LEFT (x: '0%')
           ========================================================================= */}
        <motion.div
          className="hidden md:flex absolute top-0 bottom-0 w-1/2 z-30 p-10 lg:p-12 flex-col justify-center items-center text-center overflow-hidden bg-gradient-to-br from-[#121B19] via-[#152320] to-[#0D1513] border-x border-[#B7FF35]/25 shadow-[0_0_50px_rgba(0,0,0,0.6)]"
          initial={false}
          animate={{
            x: mode === 'signin' ? '100%' : '0%'
          }}
          transition={{
            duration: 0.65,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          {/* Subtle neon glowing mesh backdrop */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#B7FF35]/15 rounded-full blur-[90px]" />
            <div className="absolute inset-0 bg-[radial-gradient(#B7FF35_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04]" />
          </div>

          {/* Dynamic Content based on current mode */}
          <AnimatePresence mode="wait">
            {mode === 'signin' ? (
              <motion.div
                key="welcome-signup-prompt"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="relative z-10 flex flex-col items-center"
              >
                {/* Shield Badge */}
                <div className="w-16 h-16 rounded-2xl bg-[#1A2623] border border-[#B7FF35]/50 flex items-center justify-center shadow-[0_0_25px_rgba(183,255,53,0.25)] mb-6">
                  <ShieldCheck className="w-8 h-8 text-[#B7FF35]" />
                </div>

                <h3 className="text-3xl font-extrabold text-[#F2F5EF] font-display tracking-tight mb-3">
                  Hello, Friend!
                </h3>

                <p className="text-sm text-[#D1DDD6] max-w-xs leading-relaxed mb-8">
                  Join META RESOLVE and experience a smarter, more organized account-recovery support experience.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setSuccessMessage('');
                    setMode('signup');
                  }}
                  className="px-8 py-3.5 rounded-xl border-2 border-[#B7FF35] hover:bg-[#B7FF35] text-[#B7FF35] hover:text-[#090D0D] font-bold text-sm tracking-wide uppercase transition-all duration-300 shadow-[0_0_20px_rgba(183,255,53,0.15)] hover:shadow-[0_0_30px_rgba(183,255,53,0.4)] cursor-pointer active:scale-95"
                >
                  CREATE ACCOUNT
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="welcome-signin-prompt"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="relative z-10 flex flex-col items-center"
              >
                {/* Shield Badge */}
                <div className="w-16 h-16 rounded-2xl bg-[#1A2623] border border-[#B7FF35]/50 flex items-center justify-center shadow-[0_0_25px_rgba(183,255,53,0.25)] mb-6">
                  <KeyRound className="w-8 h-8 text-[#B7FF35]" />
                </div>

                <h3 className="text-3xl font-extrabold text-[#F2F5EF] font-display tracking-tight mb-3">
                  Welcome Back!
                </h3>

                <p className="text-sm text-[#D1DDD6] max-w-xs leading-relaxed mb-8">
                  To stay connected with your account recovery status, please login with your personal credentials.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setSuccessMessage('');
                    setMode('signin');
                  }}
                  className="px-8 py-3.5 rounded-xl border-2 border-[#B7FF35] hover:bg-[#B7FF35] text-[#B7FF35] hover:text-[#090D0D] font-bold text-sm tracking-wide uppercase transition-all duration-300 shadow-[0_0_20px_rgba(183,255,53,0.15)] hover:shadow-[0_0_30px_rgba(183,255,53,0.4)] cursor-pointer active:scale-95"
                >
                  SIGN IN
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* =========================================================================
          PASSWORD RESET MODAL
         ========================================================================= */}
      <AnimatePresence>
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md bg-[#141A19] border border-[#B7FF35]/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(183,255,53,0.15)] relative overflow-hidden"
            >
              {/* Top neon glow bar */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#B7FF35] to-transparent" />

              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#1B211F] border border-[#B7FF35]/40 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-[#B7FF35]" />
                </div>
                <h3 className="text-xl font-extrabold text-[#F2F5EF] font-display">
                  Reset Your Password
                </h3>
              </div>

              <p className="text-xs text-[#9AA49E] leading-relaxed mb-5">
                Enter the email address registered with your META RESOLVE account. We will send you a secure verification link to reset your credentials.
              </p>

              {resetErrorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{resetErrorMessage}</span>
                </div>
              )}

              {resetSuccessMessage ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#B7FF35]/15 border border-[#B7FF35]/40 text-[#B7FF35] text-xs flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{resetSuccessMessage}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetSuccessMessage('');
                    }}
                    className="w-full py-3 rounded-xl bg-[#1B211F] hover:bg-[#242E2A] border border-white/10 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendResetLink} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#D1DDD6] mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#68736D]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[#1B211F] border border-white/[0.1] focus:border-[#B7FF35] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[#52635B] focus:outline-none focus:ring-1 focus:ring-[#B7FF35]/40 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="w-1/3 py-3 rounded-xl bg-[#1B211F] hover:bg-[#242E2A] border border-white/10 text-[#9AA49E] hover:text-white font-medium text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isResetLoading}
                      className="w-2/3 bg-gradient-to-r from-[#A3F226] via-[#B7FF35] to-[#C8FF52] hover:from-[#B7FF35] hover:to-[#D5FF6E] text-[#090D0D] font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(183,255,53,0.3)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-80"
                    >
                      {isResetLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>SEND RESET LINK</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          GOOGLE OAUTH GUIDANCE MODAL
         ========================================================================= */}
      <AnimatePresence>
        {googleStatusModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#141A19] border border-[#B7FF35]/30 rounded-2xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center gap-2.5 mb-3 text-[#B7FF35]">
                <Info className="w-5 h-5 shrink-0" />
                <h4 className="font-bold text-base text-[#F2F5EF]">
                  {googleStatusModal.title}
                </h4>
              </div>

              <p className="text-xs text-[#D1DDD6] leading-relaxed mb-4">
                {googleStatusModal.message}
              </p>

              <div className="p-3 rounded-xl bg-[#1B211F] border border-white/[0.08] mb-4 text-[11px] font-mono text-[#9AA49E] space-y-1">
                <div>Tip: Test credentials ready immediately:</div>
                <div className="text-[#B7FF35] font-semibold">
                  Email: client@metaresolve.com
                </div>
                <div className="text-[#B7FF35] font-semibold">
                  Password: MetaClient2026!
                </div>
              </div>

              <button
                type="button"
                onClick={() => setGoogleStatusModal({ show: false, title: '', message: '' })}
                className="w-full py-2.5 rounded-xl bg-[#B7FF35] hover:bg-[#C8FF52] text-[#090D0D] font-bold text-xs transition-colors cursor-pointer"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
