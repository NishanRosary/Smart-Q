import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../shared/Sidebar';
import QRCodeDisplay from '../shared/QRCodeDisplay';
import socket from '../../socket';
import '../../styles/admin.css';
import '../../styles/global.css';

const ORGANIZATION_TYPES = [
  'Hospital',
  'Bank',
  'Interview',
  'Government Office',
  'Bangalore One Office',
  'Others',
];

const EventScheduler = ({ onNavigate, goBack, currentPage }) => {
  const [formData, setFormData] = useState({
    organizationType: '',
    organizationName: '',
    doctorName: '',
    profession: '',
    hrOrPocName: '',
    title: '',
    totalTokens: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    serviceTypes: []
  });
  const [currentService, setCurrentService] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [newEvent, setNewEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState('');
  const [completingEventId, setCompletingEventId] = useState('');

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/events', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  };

  // Fetch events + keep in sync with queue updates
  useEffect(() => {
    fetchEvents();

    socket.on('queue:update', fetchEvents);
    return () => {
      socket.off('queue:update', fetchEvents);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === 'organizationType') {
        return {
          ...prev,
          organizationType: value,
          doctorName: '',
          profession: '',
          hrOrPocName: ''
        };
      }

      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      alert('End date must be the same as or later than start date.');
      return;
    }
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate === formData.endDate &&
      formData.startTime &&
      formData.endTime &&
      formData.endTime <= formData.startTime
    ) {
      alert('End time must be later than start time for single-day events.');
      return;
    }
    if (formData.organizationType === 'Hospital') {
      if (!formData.doctorName.trim() || !formData.profession.trim()) {
        alert('Doctor Name and Profession are required for Hospital events.');
        return;
      }
    }
    if (formData.organizationType === 'Interview' && !formData.hrOrPocName.trim()) {
      alert('HR Name / POC Name is required for Interview events.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/events', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setNewEvent(response.data);
      setShowSuccess(true);
      setFormData({
        organizationType: '',
        organizationName: '',
        doctorName: '',
        profession: '',
        hrOrPocName: '',
        title: '',
        totalTokens: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        location: '',
        serviceTypes: []
      });
      await fetchEvents();
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error creating event:', error);
      alert(error.response?.data?.message || 'Failed to create event. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    try {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (currentService.trim()) {
      setFormData(prev => ({
        ...prev,
        serviceTypes: [...prev.serviceTypes, currentService.trim()]
      }));
      setCurrentService('');
    }
  };

  const handleRemoveService = (index) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.filter((_, i) => i !== index)
    }));
  };

  const handleCompleteEvent = async (eventId) => {
    const shouldComplete = window.confirm('Mark this event as completed? It will be moved to Event History.');
    if (!shouldComplete) return;

    setCompletingEventId(eventId);
    try {
      await axios.post(`http://localhost:5000/api/events/${eventId}/complete`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      await fetchEvents();
    } catch (error) {
      console.error('Error completing event:', error);
      alert(error.response?.data?.message || 'Failed to complete event.');
    } finally {
      setCompletingEventId('');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const shouldDelete = window.confirm('Delete this scheduled event? This will also remove its queue tokens.');
    if (!shouldDelete) return;

    setDeletingEventId(eventId);
    try {
      await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(error.response?.data?.message || 'Failed to delete event.');
    } finally {
      setDeletingEventId('');
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} goBack={goBack} />
      <main className="admin-main">
        <div className="admin-header">
          <h1>Event Scheduler</h1>
        </div>

        <div className="event-scheduler-form">
          <h2 style={{ marginBottom: '1.5rem' }}>Schedule New Event</h2>

          {showSuccess && (
            <div className="success-message">
              <span>✓</span>
              <span>Event scheduled successfully! It will appear in Customer Dashboard.</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="organizationType">Organization Type</label>
                <select
                  id="organizationType"
                  name="organizationType"
                  value={formData.organizationType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select Organization Type --</option>
                  {ORGANIZATION_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="title">Event Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="organizationName">Organization Name</label>
                <input
                  type="text"
                  id="organizationName"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  placeholder="Enter organization name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="totalTokens">Number of Tokens</label>
                <input
                  type="number"
                  id="totalTokens"
                  name="totalTokens"
                  min="1"
                  max="9999"
                  value={formData.totalTokens}
                  onChange={handleInputChange}
                  placeholder="Enter total tokens (max 9999)"
                  required
                />
              </div>
            </div>

            {formData.organizationType === 'Hospital' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="doctorName">Doctor Name</label>
                  <input
                    type="text"
                    id="doctorName"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleInputChange}
                    placeholder="Enter doctor name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="profession">Profession</label>
                  <input
                    type="text"
                    id="profession"
                    name="profession"
                    value={formData.profession}
                    onChange={handleInputChange}
                    placeholder="Enter profession"
                    required
                  />
                </div>
              </div>
            )}

            {formData.organizationType === 'Interview' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="hrOrPocName">HR Name / POC Name</label>
                  <input
                    type="text"
                    id="hrOrPocName"
                    name="hrOrPocName"
                    value={formData.hrOrPocName}
                    onChange={handleInputChange}
                    placeholder="Enter HR or POC name"
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  min={formData.startDate || undefined}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="startTime">Start Time</label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endTime">End Time</label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter event location"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="serviceTypes">Service Types (Manual Entry)</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  id="serviceTypes"
                  value={currentService}
                  onChange={(e) => setCurrentService(e.target.value)}
                  placeholder="Type a service and press Enter or Add"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddService(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddService}
                  className="btn-secondary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Add Service
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {formData.serviceTypes.map((service, index) => (
                  <span
                    key={index}
                    className="badge badge-green"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {service}
                    <button
                      type="button"
                      onClick={() => handleRemoveService(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {formData.serviceTypes.length === 0 && (
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', fontStyle: 'italic' }}>
                    No services added yet. Add at least one service type.
                  </span>
                )}
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Save Event
            </button>
          </form>

          {newEvent && (
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: '#F3F4F6',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>Event QR Code</h3>
              <QRCodeDisplay eventData={newEvent} size={200} />
            </div>
          )}
        </div>

        <div className="events-list">
          <div className="events-list-header">
            <h2>Scheduled Events</h2>
            <span className="badge badge-green">{events.length} Events</span>
          </div>

          <div className="events-table-wrapper">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Event</th>
                  <th>Schedule</th>
                  <th>Location</th>
                  <th>Tokens</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id}>
                    {(() => {
                      const startDate = event.startDate || event.date;
                      const endDate = event.endDate || event.startDate || event.date;
                      const [legacyStartTime, legacyEndTime] = String(event.time || '').includes('-')
                        ? String(event.time).split('-').map((t) => t.trim())
                        : [event.time, event.time];
                      const startTime = event.startTime || legacyStartTime;
                      const endTime = event.endTime || legacyEndTime;
                      const canComplete = event.isFull && (event.activeQueueCount === 0);
                      const completeTooltip = !event.isFull
                        ? 'Tokens are still available. All tokens must be used first.'
                        : event.activeQueueCount > 0
                          ? 'Queue has active entries (waiting/serving). All must be completed or cancelled.'
                          : 'Mark this event as completed';
                      return (
                        <>
                          <td>
                            <div className="events-table-primary-cell">{event.organizationType}</div>
                            <div className="events-table-secondary-cell">{event.organizationName || '-'}</div>
                          </td>
                          <td>
                            <div className="events-table-primary-cell">{event.title}</div>
                          </td>
                          <td>
                            <div className="events-table-primary-cell">
                              {startDate ? new Date(startDate).toLocaleDateString() : '-'} to {endDate ? new Date(endDate).toLocaleDateString() : '-'}
                            </div>
                            <div className="events-table-secondary-cell">
                              {formatTime(startTime)} to {formatTime(endTime)}
                            </div>
                          </td>
                          <td>{event.location}</td>
                          <td>
                            <div className="events-table-primary-cell">{event.totalTokens ?? '-'}</div>
                            <div className="events-table-secondary-cell">Available: {event.availableTokens ?? '-'}</div>
                          </td>
                          <td>
                            <span className={`badge ${event.status === 'Upcoming' ? 'badge-yellow' :
                              event.status === 'Ongoing' ? 'badge-green' : 'badge-red'
                              }`}>
                              {event.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => handleCompleteEvent(event.id)}
                                disabled={!canComplete || completingEventId === event.id || deletingEventId === event.id}
                                title={completeTooltip}
                                style={{
                                  color: canComplete ? '#059669' : '#9CA3AF',
                                  borderColor: canComplete ? '#A7F3D0' : '#E5E7EB',
                                  fontSize: '0.85rem',
                                  cursor: canComplete ? 'pointer' : 'not-allowed',
                                  opacity: canComplete ? 1 : 0.6
                                }}
                              >
                                {completingEventId === event.id ? 'Completing...' : 'Complete'}
                              </button>
                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => handleDeleteEvent(event.id)}
                                disabled={deletingEventId === event.id || completingEventId === event.id}
                                style={{ color: '#DC2626', borderColor: '#FCA5A5', fontSize: '0.85rem' }}
                              >
                                {deletingEventId === event.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </>
                      );
                    })()}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventScheduler;
