import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import EventForm from '../components/EventForm';

export default function EventEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadEvent();
  }, [id]);

  async function loadEvent() {
    try {
      setLoading(true);
      const data = await eventService.getEventById(id);
      setEventData(data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(formData) {
    setSaving(true);
    setErrorMsg('');
    try {
      await eventService.updateEvent(id, formData);
      setSuccessMsg('Event updated successfully!');
      setTimeout(() => navigate('/events'), 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 60, color: '#6b7280' }}>
        <span style={{ display: 'inline-block', width: 28, height: 28, border: '3px solid #e5e7eb', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ marginTop: 12 }}>Loading event data…</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Event: {eventData?.title}</h1>
          <p className="page-subtitle">Update event details, status, schedule, venue, and ticketing options</p>
        </div>
      </div>
      {eventData && (
        <EventForm
          initialData={eventData}
          onSubmit={handleSubmit}
          saving={saving}
          successMsg={successMsg}
          errorMsg={errorMsg}
          isEdit={true}
        />
      )}
    </div>
  );
}
