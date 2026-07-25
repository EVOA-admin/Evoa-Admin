import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RiAddLine, RiEditLine, RiDeleteBinLine, RiStarLine, RiStarFill,
  RiSearchLine, RiCalendarEventLine, RiMapPinLine, RiTicketLine,
} from 'react-icons/ri';
import { eventService } from '../services/eventService';
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
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

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
        <Link to="/events/create" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <RiAddLine size={18} />
          Create Event
        </Link>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'published', 'draft', 'archived'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
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
          {!events.length && (
            <Link to="/events/create" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <RiAddLine size={16} /> Create Event
            </Link>
          )}
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
