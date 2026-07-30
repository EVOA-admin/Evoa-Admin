import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { eventService } from '../services/eventService';
import EventForm from '../components/EventForm';

export default function EventCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const eventTypeParam = searchParams.get('type') || 'event_with_subscription';

  async function handleSubmit(formData) {
    setSaving(true);
    setErrorMsg('');
    try {
      await eventService.createEvent(formData);
      setSuccessMsg('Event created successfully!');
      setTimeout(() => navigate('/events'), 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Create Event</h1>
          <p className="page-subtitle">Publish a new event in under 2 minutes</p>
        </div>
      </div>
      <EventForm
        initialData={{ event_type: eventTypeParam }}
        onSubmit={handleSubmit}
        saving={saving}
        successMsg={successMsg}
        errorMsg={errorMsg}
      />
    </div>
  );
}
