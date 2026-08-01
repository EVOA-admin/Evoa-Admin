import { supabase } from '../lib/supabase';

const PRODUCTION_API_FALLBACK = 'https://evoa-backend.onrender.com/api';

function isLocalHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (configuredUrl) {
    const trimmedUrl = configuredUrl.trim().replace(/\/+$/, '');

    if (/^https?:\/\//i.test(trimmedUrl)) {
      try {
        const parsedUrl = new URL(trimmedUrl);
        parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, '');

        if (!parsedUrl.pathname || parsedUrl.pathname === '/') {
          parsedUrl.pathname = '/api';
        } else if (!parsedUrl.pathname.endsWith('/api')) {
          parsedUrl.pathname = `${parsedUrl.pathname}/api`;
        }

        return parsedUrl.toString().replace(/\/+$/, '');
      } catch {
        return trimmedUrl;
      }
    }

    if (trimmedUrl === '/api' || trimmedUrl.endsWith('/api')) {
      return trimmedUrl;
    }

    return `${trimmedUrl}/api`;
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (!isLocalHost(hostname)) {
      return PRODUCTION_API_FALLBACK;
    }
  }

  return 'http://localhost:3000/api';
}

const API_BASE_URL = resolveApiBaseUrl();
const REQUEST_TIMEOUT_MS = 8000;

function syncStoredToken(token) {
  if (token) {
    localStorage.setItem('authToken', token);
    return token;
  }

  localStorage.removeItem('authToken');
  return null;
}

async function getAccessToken() {
  const cached = localStorage.getItem('authToken');
  if (cached) return cached;

  try {
    const { data, error } = await supabase.auth.getSession();
    if (!error && data.session?.access_token) {
      return syncStoredToken(data.session.access_token);
    }
  } catch (_) { /* no-op fallback */ }

  return null;
}

async function refreshAccessToken() {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    const token = data.session?.access_token;
    if (token) {
      return syncStoredToken(token);
    }
  } catch (_) { /* no-op */ }

  syncStoredToken(null);
  return null;
}

function getErrorMessage(payload, fallback = 'Request failed.') {
  const message = payload?.message;
  if (Array.isArray(message)) {
    return message.join(', ');
  }
  return message || fallback;
}

function unwrapResponse(payload) {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }
  return payload;
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      query.set(key, value);
    }
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

export async function adminRequest(path, options = {}) {
  let token = options.token;
  if (!token && !options.skipAuth) {
    try {
      token = await getAccessToken();
    } catch (_) {
      token = localStorage.getItem('authToken');
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    if (error?.name === 'AbortError') {
      throw new Error(`Admin API request timed out after ${REQUEST_TIMEOUT_MS / 1000}s. Check backend availability at ${API_BASE_URL}.`);
    }
    if (error instanceof TypeError) {
      throw new Error(`Unable to reach admin API at ${API_BASE_URL}. Check VITE_API_BASE_URL/VITE_API_URL, backend server status, and CORS settings.`);
    }
    throw error;
  }
  clearTimeout(timeoutId);

  const payload = await response.json().catch(() => ({}));
  if (response.status === 401 && !options._isRetry && !options.skipAuth) {
    syncStoredToken(null);
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      return adminRequest(path, { ...options, token: refreshedToken, _isRetry: true });
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(payload));
  }

  return unwrapResponse(payload);
}

export const adminApi = {
  login: (body) => adminRequest('/admin/auth/login', { method: 'POST', body, skipAuth: true }),
  getAuthMe: () => adminRequest('/admin/auth/me'),
  getSession: (options) => adminRequest('/admin/session', options),
  getOverview: () => adminRequest('/admin/overview'),
  getUsers: (filters) => adminRequest(`/admin/users${buildQuery(filters)}`),
  updateUser: (userId, body) => adminRequest(`/admin/users/${userId}`, { method: 'PATCH', body }),
  getStartups: (filters) => adminRequest(`/admin/startups${buildQuery(filters)}`),
  updateStartup: (startupId, body) => adminRequest(`/admin/startups/${startupId}`, { method: 'PATCH', body }),
  removeStartupPitch: (startupId, reelId) => adminRequest(`/admin/startups/${startupId}/pitches/${reelId}`, { method: 'DELETE' }),
  getInvestors: (filters) => adminRequest(`/admin/investors${buildQuery(filters)}`),
  updateInvestor: (userId, body) => adminRequest(`/admin/investors/${userId}`, { method: 'PATCH', body }),
  getBattleground: () => adminRequest('/admin/battleground'),
  addBattlegroundStartup: (body) => adminRequest('/admin/battleground/registrations', { method: 'POST', body }),
  updateBattlegroundRegistration: (registrationId, body) =>
    adminRequest(`/admin/battleground/registrations/${registrationId}`, { method: 'PATCH', body }),
  removeBattlegroundRegistration: (registrationId) =>
    adminRequest(`/admin/battleground/registrations/${registrationId}`, { method: 'DELETE' }),
  declareWinner: (body) => adminRequest('/admin/battleground/winner', { method: 'PATCH', body }),
  getPayments: () => adminRequest('/admin/payments'),
  getEventAdmins: () => adminRequest('/admin/management'),
  createEventAdmin: (body) => adminRequest('/admin/management', { method: 'POST', body }),
  updateEventAdmin: (id, body) => adminRequest(`/admin/management/${id}`, { method: 'PATCH', body }),
  resetAdminPassword: (id, body) => adminRequest(`/admin/management/${id}/reset-password`, { method: 'PATCH', body }),
  toggleAdminStatus: (id) => adminRequest(`/admin/management/${id}/toggle-status`, { method: 'PATCH' }),
  deleteEventAdmin: (id) => adminRequest(`/admin/management/${id}`, { method: 'DELETE' }),
};
