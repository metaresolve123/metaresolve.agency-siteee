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

interface SafeApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

/**
 * Robust HTTP client that safely handles JSON, HTML, plain text, 404s, and network timeouts
 * without ever throwing unhandled "Unexpected token 'N', 'Not Found' is not valid JSON" errors.
 */
async function safeApiRequest<T = any>(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 15000
): Promise<SafeApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const rawText = await res.text().catch(() => '');
    const trimmed = rawText.trim();
    const contentType = (res.headers.get('content-type') || '').toLowerCase();

    let parsedData: any = null;
    const looksLikeJson =
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'));

    if (trimmed && (contentType.includes('application/json') || looksLikeJson)) {
      try {
        parsedData = JSON.parse(trimmed);
      } catch {
        parsedData = null;
      }
    }

    if (res.ok) {
      if (parsedData !== null) {
        return { ok: true, status: res.status, data: parsedData };
      }
      return { ok: true, status: res.status, data: {} as T };
    }

    // Process non-2xx status code with clear human-friendly messaging
    let extractedError = '';
    if (parsedData && typeof parsedData === 'object') {
      if (parsedData.error) extractedError = String(parsedData.error);
      else if (parsedData.message) extractedError = String(parsedData.message);
    }

    if (!extractedError) {
      switch (res.status) {
        case 400:
          extractedError = trimmed && trimmed.length < 120 && !trimmed.startsWith('<')
            ? trimmed
            : 'Invalid request data. Please check your entries.';
          break;
        case 401:
          extractedError = 'Invalid email or password. Please verify your credentials.';
          break;
        case 403:
          extractedError = 'Access denied. Please check your permissions.';
          break;
        case 404:
          extractedError = 'Authentication service endpoint was not found (404). Please verify deployment or retry.';
          break;
        case 409:
          extractedError = 'An account with this email address already exists.';
          break;
        case 429:
          extractedError = 'Too many requests. Please wait a few moments and try again.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          extractedError = 'Authentication server is temporarily unavailable. Please try again shortly.';
          break;
        default:
          extractedError = trimmed && trimmed.length < 100 && !trimmed.startsWith('<')
            ? trimmed
            : `Authentication request failed (HTTP ${res.status}).`;
          break;
      }
    }

    return {
      ok: false,
      status: res.status,
      data: parsedData,
      error: extractedError,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        ok: false,
        status: 408,
        data: null,
        error: 'Authentication request timed out. Please check your internet connection and try again.',
      };
    }
    return {
      ok: false,
      status: 0,
      data: null,
      error: 'Unable to connect to the authentication server. Please check your internet connection.',
    };
  }
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await safeApiRequest<{ success: boolean; user?: AuthUser }>(
      '/api/user-auth/me',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok && res.data && res.data.success && res.data.user) {
      return res.data.user;
    }

    if (res.status === 401) {
      clearStoredSession();
      return null;
    }

    // In case of transient network failure, fall back to cached session
    return getStoredUser();
  } catch (err) {
    console.warn('Failed to verify user session with server, falling back to cached user:', err);
    return getStoredUser();
  }
}

export async function loginWithEmail(
  email: string,
  password: string,
  rememberMe: boolean = true
): Promise<AuthResponse> {
  const result = await safeApiRequest<AuthResponse>('/api/user-auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, rememberMe }),
  });

  if (result.ok && result.data && result.data.success && result.data.token && result.data.user) {
    setStoredSession(result.data.token, result.data.user, rememberMe);
    return {
      success: true,
      user: result.data.user,
      token: result.data.token,
      message: result.data.message || 'Welcome back!',
    };
  }

  return {
    success: false,
    error: result.error || result.data?.error || 'Invalid email or password.',
  };
}

export async function signupWithEmail(
  name: string,
  email: string,
  password: string,
  rememberMe: boolean = true
): Promise<AuthResponse> {
  const result = await safeApiRequest<AuthResponse>('/api/user-auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, rememberMe }),
  });

  if (result.ok && result.data && result.data.success && result.data.token && result.data.user) {
    setStoredSession(result.data.token, result.data.user, rememberMe);
    return {
      success: true,
      user: result.data.user,
      token: result.data.token,
      message: result.data.message || 'Account created successfully!',
    };
  }

  return {
    success: false,
    error: result.error || result.data?.error || 'Registration failed. Please try again.',
  };
}

export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; message?: string; error?: string; resetToken?: string }> {
  const result = await safeApiRequest<{ success: boolean; message?: string; error?: string; resetToken?: string }>(
    '/api/user-auth/forgot-password',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }
  );

  if (result.ok && result.data && result.data.success) {
    return {
      success: true,
      message: result.data.message || 'Password reset link sent to your email.',
      resetToken: result.data.resetToken,
    };
  }

  return {
    success: false,
    error: result.error || result.data?.error || 'Failed to request password reset link.',
  };
}

export async function resetPassword(
  token: string,
  newPassword: string,
  confirmPassword?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const result = await safeApiRequest<{ success: boolean; message?: string; error?: string }>(
    '/api/user-auth/reset-password',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    }
  );

  if (result.ok && result.data && result.data.success) {
    return {
      success: true,
      message: result.data.message || 'Password reset successfully.',
    };
  }

  return {
    success: false,
    error: result.error || result.data?.error || 'Failed to reset password.',
  };
}

export async function logoutUser(): Promise<void> {
  const token = getStoredToken();
  clearStoredSession();
  if (token) {
    try {
      await safeApiRequest('/api/user-auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Ignore network errors on logout
    }
  }
}

export async function getGoogleAuthUrl(): Promise<{
  success: boolean;
  configured: boolean;
  url?: string;
  error?: string;
  clientId?: string;
}> {
  const result = await safeApiRequest<{
    success: boolean;
    configured: boolean;
    url?: string;
    error?: string;
    clientId?: string;
  }>('/api/user-auth/google/url');

  if (result.ok && result.data) {
    return result.data;
  }

  return {
    success: false,
    configured: false,
    error: result.error || 'Unable to check Google OAuth configuration.',
  };
}

export async function loginWithGoogleCredential(credential: string): Promise<AuthResponse> {
  const result = await safeApiRequest<AuthResponse>('/api/user-auth/google-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });

  if (result.ok && result.data && result.data.success && result.data.token && result.data.user) {
    setStoredSession(result.data.token, result.data.user, true);
    return {
      success: true,
      user: result.data.user,
      token: result.data.token,
    };
  }

  return {
    success: false,
    error: result.error || result.data?.error || 'Google authentication failed.',
  };
}
