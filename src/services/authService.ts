// API service for authentication — connects frontend to backend
// All requests use credentials: 'include' so httpOnly cookies are sent automatically

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ─── Generic Fetcher ──────────────────────────────────────────────────────────
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include', // Required for httpOnly cookie-based auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

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
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiFetch<{ success: boolean; message: string }>('/admin/auth/logout', { method: 'POST' }),

  getMe: () =>
    apiFetch<AuthResponse>('/admin/auth/me'),

  refreshToken: () =>
    apiFetch<{ success: boolean; message: string }>('/admin/auth/refresh-token', { method: 'POST' }),
};
