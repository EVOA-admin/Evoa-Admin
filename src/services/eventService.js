import { supabase } from '../lib/supabase';

const PRODUCTION_API_FALLBACK = 'https://evoa-backend.onrender.com/api';

function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (configuredUrl) {
    let trimmed = configuredUrl.trim().replace(/\/+$/, '');
    if (!trimmed.endsWith('/api')) trimmed = `${trimmed}/api`;
    return trimmed;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return PRODUCTION_API_FALLBACK;
  }
  return 'http://localhost:3000/api';
}

const API_BASE_URL = resolveApiBaseUrl();

async function getAuthHeaders() {
  let token = localStorage.getItem('authToken');
  if (!token) {
    const { data } = await supabase.auth.getSession();
    token = data?.session?.access_token;
  }
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  const payload = await res.json();
  if (!res.ok) {
    const msg = Array.isArray(payload?.message) ? payload.message.join(', ') : payload?.message;
    throw new Error(msg || `Request failed with status ${res.status}`);
  }
  if (payload && typeof payload === 'object' && payload.data !== undefined) {
    return payload.data;
  }
  return payload;
}

export const eventService = {
  async getAllEvents() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/events/admin/all`, { headers });
    return handleResponse(res);
  },

  async getEventById(id) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/events/id/${id}`, { headers });
    return handleResponse(res);
  },

  async createEvent(eventData) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/events/admin/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify(eventData),
    });
    return handleResponse(res);
  },

  async updateEvent(id, eventData) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/events/admin/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(eventData),
    });
    return handleResponse(res);
  },

  async deleteEvent(id) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/events/admin/${id}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse(res);
  },

  async setEventStatus(id, status) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/events/admin/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  async setFeaturedEvent(id) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/events/admin/${id}/featured`, {
      method: 'PATCH',
      headers,
    });
    return handleResponse(res);
  },

  async addTicket(eventId, ticketData) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/events/admin/${eventId}/tickets`, {
      method: 'POST',
      headers,
      body: JSON.stringify(ticketData),
    });
    return handleResponse(res);
  },

  async updateTicket(ticketId, ticketData) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/events/admin/tickets/${ticketId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(ticketData),
    });
    return handleResponse(res);
  },

  async deleteTicket(ticketId) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/events/admin/tickets/${ticketId}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse(res);
  },
};
