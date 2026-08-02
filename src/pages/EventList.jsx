import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  RiAddLine, RiEditLine, RiDeleteBinLine, RiStarLine, RiStarFill,
  RiSearchLine, RiCalendarEventLine, RiMapPinLine, RiTicketLine, RiArrowDownSLine,
  RiUserLine, RiMailLine, RiRefreshLine, RiCheckLine,
} from 'react-icons/ri';
import { eventService } from '../services/eventService';
import { useAuth } from '../contexts/AuthContext';
import DeleteModal from '../components/DeleteModal';

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function EventList() {
  const { profile } = useAuth();
  const isSuperAdmin = profile?.role !== 'EVENT_ADMIN';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const createMenuRef = useRef(null);

  // Customers Tab State
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerError, setCustomerError] = useState('');

  useEffect(() => {
    function handleClickOutside(event) {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target)) {
        setShowCreateMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (statusFilter === 'customers' && isSuperAdmin) {
      loadCustomers();
      const interval = setInterval(loadCustomers, 15000); // Auto update customer list
      return () => clearInterval(interval);
    }
  }, [statusFilter, isSuperAdmin]);

  async function loadEvents() {
    try {
      setLoading(true);
      setError('');
      const resData = await eventService.getAllEvents();
      const list = Array.isArray(resData) ? resData : (resData?.data || []);
      setEvents(list);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomers() {
    try {
      setLoadingCustomers(true);
      setCustomerError('');
      const resData = await eventService.getEventCustomers();
      const list = Array.isArray(resData) ? resData : (resData?.data || []);
      setCustomers(list);
    } catch (err) {
      setCustomerError(err.message || 'Failed to load customer ticket purchases');
    } finally {
      setLoadingCustomers(false);
    }
  }

  function showToast(msg, type = 'success') {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(''), 3500);
  }

  async function handleToggleStatus(evt) {
    const nextStatus = evt.status === 'published' ? 'draft' : 'published';
    setActionLoadingId(evt.id);
    try {
      const updated = await eventService.setEventStatus(evt.id, nextStatus);
      const updatedItem = updated?.data || updated;
      setEvents(prev => (Array.isArray(prev) ? prev : []).map(e => e.id === evt.id ? { ...e, status: updatedItem.status || nextStatus } : e));
      showToast(`Event status updated to ${nextStatus}.`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleToggleFeatured(evt) {
    if (evt.isFeatured) return; // Already featured
    setActionLoadingId(evt.id);
    try {
      const updated = await eventService.setFeaturedEvent(evt.id);
      const updatedItem = updated?.data || updated;
      setEvents(prev => (Array.isArray(prev) ? prev : []).map(e => ({
        ...e,
        isFeatured: e.id === evt.id,
        status: e.id === evt.id ? 'published' : e.status,
      })));
      showToast(`"${updatedItem.title || evt.title}" is now the Featured Event!`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await eventService.deleteEvent(deleteTarget.id);
      setEvents(prev => (Array.isArray(prev) ? prev : []).filter(e => e.id !== deleteTarget.id));
      showToast('Event deleted successfully.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  const eventList = Array.isArray(events) ? events : (events?.data || []);
  const filteredEvents = eventList.filter(evt => {
    const matchesSearch = (evt.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (evt.collaborationName || '').toLowerCase().includes(search.toLowerCase()) ||
      (evt.city || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || evt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page">
      {/* Toast alert */}
      {toastMsg && (
        <div className={`toast toast-${toastType}`}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <RiCalendarEventLine style={{ color: '#6366f1' }} />
            Event Management
          </h1>
          <p className="page-subtitle">Manage live events, collaborations, schedules, venue details, and ticketing tiers</p>
        </div>
        {/* Create Event Dropdown Menu */}
        <div style={{ position: 'relative' }} ref={createMenuRef}>
          <button
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              paddingRight: 14,
              fontWeight: 600,
              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.25)',
              cursor: 'pointer',
            }}
          >
            <RiAddLine size={18} />
            Create Event
            <RiArrowDownSLine
              size={18}
              style={{
                transform: showCreateMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {showCreateMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 290,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                boxShadow: '0 12px 36px rgba(15, 23, 42, 0.15), 0 4px 12px rgba(15, 23, 42, 0.08)',
                zIndex: 100,
                padding: '8px 0',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '8px 16px 6px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>
                Select Event Type
              </div>

              <Link
                to="/events/create?type=event"
                onClick={() => setShowCreateMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  color: '#0f172a',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease',
                  borderBottom: '1px solid #f8fafc',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <RiTicketLine size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Event</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, lineHeight: 1.35 }}>
                    Event access pass only (no Evoa subscription)
                  </div>
                </div>
              </Link>

              <Link
                to="/events/create?type=event_with_subscription"
                onClick={() => setShowCreateMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  color: '#0f172a',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <RiCalendarEventLine size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#4338ca' }}>
                    Event + Evoa Subscription
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, lineHeight: 1.35 }}>
                    Event pass + 1 Month Evoa subscription
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {(isSuperAdmin ? ['all', 'published', 'draft', 'archived', 'customers'] : ['all', 'published', 'draft', 'archived']).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {status === 'customers' ? 'Customers' : status}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', width: 280 }}>
          <RiSearchLine size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder={statusFilter === 'customers' ? "Search name, email, event..." : "Search events..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: 36, height: 36, fontSize: 13, width: '100%' }}
          />
        </div>
      </div>

      {/* CUSTOMERS TAB VIEW */}
      {statusFilter === 'customers' ? (
        loadingCustomers ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
            <span style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ marginTop: 12 }}>Loading customer purchases…</p>
          </div>
        ) : customerError ? (
          <div className="card" style={{ padding: 24, background: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b' }}>
            <p>Error: {customerError}</p>
            <button onClick={loadCustomers} className="btn btn-sm btn-secondary" style={{ marginTop: 12 }}>
              Retry
            </button>
          </div>
        ) : (
          <div className="table-container">
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                Total Purchased Tickets: {customers.filter(c => {
                  const q = (search || '').toLowerCase().trim();
                  if (!q) return true;
                  return (
                    (c.fullName || '').toLowerCase().includes(q) ||
                    (c.email || '').toLowerCase().includes(q) ||
                    (c.eventName || '').toLowerCase().includes(q) ||
                    (c.userRole || '').toLowerCase().includes(q) ||
                    (c.ticketCode || '').toLowerCase().includes(q)
                  );
                }).length}
              </span>
              <button
                onClick={loadCustomers}
                className="btn btn-sm btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
              >
                <RiRefreshLine size={14} /> Refresh List
              </button>
            </div>

            {customers.filter(c => {
              const q = (search || '').toLowerCase().trim();
              if (!q) return true;
              return (
                (c.fullName || '').toLowerCase().includes(q) ||
                (c.email || '').toLowerCase().includes(q) ||
                (c.eventName || '').toLowerCase().includes(q) ||
                (c.userRole || '').toLowerCase().includes(q) ||
                (c.ticketCode || '').toLowerCase().includes(q)
              );
            }).length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#6b7280' }}>
                <RiUserLine size={48} style={{ margin: '0 auto 12px', opacity: 0.4, color: '#6366f1' }} />
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>No Customer Purchases Found</h3>
                <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                  {search ? 'No tickets match your search query.' : 'No users have completed ticket purchases yet.'}
                </p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>Event Name</th>
                    <th>User Role</th>
                    <th>Purchase Date & Time</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers
                    .filter(c => {
                      const q = (search || '').toLowerCase().trim();
                      if (!q) return true;
                      return (
                        (c.fullName || '').toLowerCase().includes(q) ||
                        (c.email || '').toLowerCase().includes(q) ||
                        (c.eventName || '').toLowerCase().includes(q) ||
                        (c.userRole || '').toLowerCase().includes(q) ||
                        (c.ticketCode || '').toLowerCase().includes(q)
                      );
                    })
                    .map(c => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                              {(c.fullName || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{c.fullName}</div>
                              <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>{c.ticketCode}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155', fontSize: 13 }}>
                            <RiMailLine size={14} style={{ color: '#94a3b8' }} />
                            <span>{c.email}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-indigo" style={{ fontWeight: 600 }}>
                            {c.eventName}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-purple" style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 700 }}>
                            {c.userRole}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: '#475569' }}>
                          {c.purchaseDate ? new Date(c.purchaseDate).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          }) : 'N/A'}
                        </td>
                        <td>
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                            <RiCheckLine size={13} />
                            {c.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )
      ) : loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
          <span style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ marginTop: 12 }}>Loading events…</p>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: 24, background: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b' }}>
          <p>Error: {error}</p>
          <button onClick={loadEvents} className="btn btn-sm btn-secondary" style={{ marginTop: 12 }}>
            Retry
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: '#6b7280' }}>
          <RiCalendarEventLine size={48} style={{ margin: '0 auto 12px', opacity: 0.4, color: '#6366f1' }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>No events found</h3>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {search || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Get started by creating your first EVOA event.'}
          </p>
        </div>
      ) : (
        /* Events Table */
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Venue / Format</th>
                <th>Schedule</th>
                <th>Tickets</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map(evt => {
                const tickets = evt.tickets || [];
                const minPrice = tickets.length ? Math.min(...tickets.map(t => parseFloat(t.price))) : null;

                return (
                  <tr key={evt.id}>
                    {/* Title & Info */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {evt.posterUrl ? (
                          <img src={evt.posterUrl} alt={evt.title} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                            {evt.title.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{evt.title}</div>
                          {evt.collaborationName && (
                            <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 500, marginTop: 2 }}>{evt.collaborationName}</div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: (evt.eventType === 'event' || evt.eventType === 'event_only') ? '#f1f5f9' : '#e0e7ff',
                              color: (evt.eventType === 'event' || evt.eventType === 'event_only') ? '#475569' : '#4338ca',
                              border: (evt.eventType === 'event' || evt.eventType === 'event_only') ? '1px solid #cbd5e1' : '1px solid #c7d2fe',
                            }}>
                              {(evt.eventType === 'event' || evt.eventType === 'event_only') ? 'Event' : 'Event + Subscription'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span className={`badge badge-${evt.status === 'published' ? 'published' : evt.status === 'draft' ? 'draft' : 'archived'}`}>
                        {evt.status}
                      </span>
                    </td>

                    {/* Featured Toggle */}
                    <td>
                      <button
                        onClick={() => handleToggleFeatured(evt)}
                        disabled={actionLoadingId === evt.id}
                        title={evt.isFeatured ? 'Current Featured Event' : 'Click to set as Featured Event'}
                        style={{
                          background: 'none', border: 'none', cursor: evt.isFeatured ? 'default' : 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6,
                          color: evt.isFeatured ? '#eab308' : '#9ca3af', fontWeight: 600, fontSize: 12
                        }}
                      >
                        {evt.isFeatured ? <RiStarFill size={18} /> : <RiStarLine size={18} />}
                        {evt.isFeatured ? 'Featured' : 'Set Featured'}
                      </button>
                    </td>

                    {/* Venue */}
                    <td>
                      <div style={{ fontSize: 13, color: '#374151', textTransform: 'capitalize' }}>
                        <RiMapPinLine style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px', color: '#6b7280' }} />
                        {evt.venueType} ({evt.city || 'Global'})
                      </div>
                    </td>

                    {/* Schedule */}
                    <td>
                      <div style={{ fontSize: 13, color: '#374151' }}>
                        {formatDate(evt.startDate)}
                      </div>
                      {evt.startTime && <div style={{ fontSize: 12, color: '#6b7280' }}>{evt.startTime} {evt.timezone}</div>}
                    </td>

                    {/* Tickets */}
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
                        <RiTicketLine style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px', color: '#6366f1' }} />
                        {tickets.length} tier{tickets.length !== 1 ? 's' : ''}
                      </div>
                      {minPrice !== null && (
                        <div style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>From ₹{minPrice}</div>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => handleToggleStatus(evt)}
                          disabled={actionLoadingId === evt.id}
                          className="btn btn-sm btn-secondary"
                          title={evt.status === 'published' ? 'Unpublish to Draft' : 'Publish Event'}
                        >
                          {evt.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <Link to={`/events/edit/${evt.id}`} className="btn btn-sm btn-secondary" title="Edit Event">
                          <RiEditLine size={15} />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(evt)}
                          className="btn btn-sm btn-danger-outline"
                          title="Delete Event"
                        >
                          <RiDeleteBinLine size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteModal
          title="Delete Event"
          message={`Are you sure you want to delete "${deleteTarget.title}"? All ticket tiers and event settings will be permanently removed.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
