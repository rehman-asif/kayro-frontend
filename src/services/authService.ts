// API service for authentication — connects frontend to backend
// All requests use credentials: 'include' so httpOnly cookies are sent automatically

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ─── Generic Fetcher ──────────────────────────────────────────────────────────
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { headers: optionHeaders, ...rest } = options;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...rest,
    credentials: 'include', // Always include cookies (do not let options overwrite)
    headers: {
      'Content-Type': 'application/json',
      ...(optionHeaders as Record<string, string> | undefined),
    },
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      'API did not return JSON. The /api proxy may be misconfigured — check Netlify redirects.'
    );
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthUser;
}

// ─── User Auth ────────────────────────────────────────────────────────────────
export const userAuthService = {
  register: (name: string, email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiFetch<{ success: boolean; message: string }>('/auth/logout', { method: 'POST' }),

  getMe: () =>
    apiFetch<AuthResponse>('/auth/me'),

  refreshToken: () =>
    apiFetch<{ success: boolean; message: string }>('/auth/refresh-token', { method: 'POST' }),
};

// ─── Admin Auth ───────────────────────────────────────────────────────────────
export const adminAuthService = {
  register: (name: string, email: string, password: string) =>
    apiFetch<AuthResponse>('/admin/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  forgotPassword: (email: string) =>
    apiFetch<{ success: boolean; message: string; data?: { resetUrl: string } }>(
      '/admin/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    ),

  resetPassword: (token: string, password: string) =>
    apiFetch<AuthResponse>(`/admin/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  logout: () =>
    apiFetch<{ success: boolean; message: string }>('/admin/auth/logout', { method: 'POST' }),

  getMe: () =>
    apiFetch<AuthResponse>('/admin/auth/me'),

  refreshToken: () =>
    apiFetch<{ success: boolean; message: string }>('/admin/auth/refresh-token', { method: 'POST' }),
};
