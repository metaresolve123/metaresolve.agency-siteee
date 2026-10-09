/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthUser, AuthResponse } from '../types';

const AUTH_TOKEN_KEY = 'metaresolve_auth_token';
const AUTH_USER_KEY = 'metaresolve_auth_user';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_USER_KEY) || sessionStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredSession(token: string, user: AuthUser, rememberMe: boolean = true) {
  if (typeof window === 'undefined') return;
  const storage = rememberMe ? localStorage : sessionStorage;
  const otherStorage = rememberMe ? sessionStorage : localStorage;

  otherStorage.removeItem(AUTH_TOKEN_KEY);
  otherStorage.removeItem(AUTH_USER_KEY);

  storage.setItem(AUTH_TOKEN_KEY, token);
  storage.setItem(AUTH_USER_KEY, JSON.stringify(user));

  window.dispatchEvent(new CustomEvent('metaresolve_auth_changed', { detail: user }));
}

export function clearStoredSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);

  window.dispatchEvent(new CustomEvent('metaresolve_auth_changed', { detail: null }));
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/user-auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      clearStoredSession();
      return null;
    }

    const data = await res.json();
    if (data.success && data.user) {
      return data.user as AuthUser;
    }
    return null;
  } catch (err) {
    console.warn('Failed to verify user session with server, falling back to cached user:', err);
    return getStoredUser();
  }
}

export async function loginWithEmail(email: string, password: string, rememberMe: boolean = true): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/user-auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe })
    });

    const data = await res.json();
    if (res.ok && data.success && data.token && data.user) {
      setStoredSession(data.token, data.user, rememberMe);
      return { success: true, user: data.user, token: data.token, message: data.message };
    }

    return { success: false, error: data.error || 'Authentication failed' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error during sign in' };
  }
}

export async function signupWithEmail(name: string, email: string, password: string, rememberMe: boolean = true): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/user-auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, rememberMe })
    });

    const data = await res.json();
    if (res.ok && data.success && data.token && data.user) {
      setStoredSession(data.token, data.user, rememberMe);
      return { success: true, user: data.user, token: data.token, message: data.message };
    }

    return { success: false, error: data.error || 'Registration failed' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error during registration' };
  }
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; message?: string; error?: string; resetToken?: string }> {
  try {
    const res = await fetch('/api/user-auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message, resetToken: data.resetToken };
    }
    return { success: false, error: data.error || 'Failed to request password reset' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error during password reset request' };
  }
}

export async function resetPassword(token: string, newPassword: string, confirmPassword?: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/user-auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword, confirmPassword })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || 'Failed to reset password' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error during password reset' };
  }
}

export async function logoutUser(): Promise<void> {
  const token = getStoredToken();
  clearStoredSession();
  if (token) {
    try {
      await fetch('/api/user-auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      // Ignore network errors on logout
    }
  }
}

export async function getGoogleAuthUrl(): Promise<{ success: boolean; configured: boolean; url?: string; error?: string; clientId?: string }> {
  try {
    const res = await fetch('/api/user-auth/google/url');
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, configured: false, error: err?.message || 'Network error checking Google OAuth' };
  }
}

export async function loginWithGoogleCredential(credential: string): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/user-auth/google-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });

    const data = await res.json();
    if (res.ok && data.success && data.token && data.user) {
      setStoredSession(data.token, data.user, true);
      return { success: true, user: data.user, token: data.token };
    }
    return { success: false, error: data.error || 'Google authentication failed' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error during Google sign in' };
  }
}
