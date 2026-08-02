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
    try {
      const res = await fetch(`${API_BASE_URL}/events/admin/all`, { headers });
      if (res.status === 404) {
        const fallbackRes = await fetch(`${API_BASE_URL}/events`, { headers });
        return handleResponse(fallbackRes);
      }
      return handleResponse(res);
    } catch (err) {
      if (err.message && err.message.includes('Cannot GET')) {
        const fallbackRes = await fetch(`${API_BASE_URL}/events`, { headers });
        return handleResponse(fallbackRes);
      }
      throw err;
    }
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

  async getEventCustomers() {
    const headers = await getAuthHeaders();
    let backendTickets = null;

    try {
      const res = await fetch(`${API_BASE_URL}/events/admin/customers`, { headers });
      if (res.ok) {
        backendTickets = await handleResponse(res);
      }
    } catch (err) {
      console.warn('Backend customers API endpoint unavailable, falling back to Supabase:', err);
    }

    if (Array.isArray(backendTickets) && backendTickets.length > 0) {
      return backendTickets;
    }

    // Resilient Fallback: Query Supabase user_event_tickets table directly
    let supabaseTickets = [];
    try {
      const { data: tickets, error } = await supabase
        .from('user_event_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(tickets)) {
        supabaseTickets = tickets;
      }
    } catch (sbErr) {
      console.error('Supabase customer tickets fallback error:', sbErr);
    }

    // Combine Supabase tickets & local browser tickets
    let localTickets = [];
    try {
      const stored = localStorage.getItem('evoa_user_purchased_tickets');
      if (stored) localTickets = JSON.parse(stored);
      const mapStored = localStorage.getItem('evoa_user_tickets_map');
      if (mapStored) {
        const parsedMap = JSON.parse(mapStored);
        Object.values(parsedMap).forEach(t => {
          if (t && typeof t === 'object') localTickets.push(t);
        });
      }
    } catch (_) {}

    // Fetch published events to map eventId -> title
    let eventsList = [];
    try {
      const { data: evts } = await supabase.from('events').select('id, title');
      eventsList = evts || [];
    } catch (_) {}

    const eventTitleMap = {};
    eventsList.forEach(e => { eventTitleMap[e.id] = e.title; });

    const allCombined = [...supabaseTickets, ...localTickets];
    const seenCodes = new Set();
    const result = [];

    allCombined.forEach(ut => {
      const code = ut.ticket_code || ut.ticketCode || ut.id;
      if (!code || seenCodes.has(code)) return;
      seenCodes.add(code);

      const rawName = ut.user_name || ut.userName || ut.fullName || '';
      const isEmail = (str) => typeof str === 'string' && str.includes('@');
      let fullName = rawName && !isEmail(rawName) ? rawName.trim() : '';
      const email = ut.user_email || ut.userEmail || ut.email || '';

      if (!fullName && email && isEmail(email)) {
        const handle = email.split('@')[0].replace(/[._-]/g, ' ');
        fullName = handle.replace(/\b\w/g, (c) => c.toUpperCase());
      }
      if (!fullName) fullName = 'Attendee';

      const price = Number(ut.price || 0);
      const eventId = ut.event_id || ut.eventId;
      const eventName = ut.event?.title || eventTitleMap[eventId] || 'EVOA Event';

      result.push({
        id: ut.id || code,
        ticketCode: code,
        fullName,
        email: email || 'N/A',
        eventName,
        eventId,
        userRole: (ut.user_role || ut.userRole || 'ATTENDEE').toUpperCase(),
        purchaseDate: ut.created_at || ut.createdAt || new Date().toISOString(),
        price,
        paymentStatus: price > 0 ? 'COMPLETED (PAID)' : 'COMPLETED (FREE PASS)',
        orderId: ut.order_id || ut.orderId || null,
        paymentId: ut.payment_id || ut.paymentId || null,
      });
    });

    return result.sort((a, b) => new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0));
  },
};
