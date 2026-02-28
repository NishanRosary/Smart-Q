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
  'Exam',
  'Restaurant',
  'Retail Store',
  'Other'
];

const EventScheduler = ({ onNavigate, goBack, currentPage }) => {
  const [formData, setFormData] = useState({
    organizationType: '',
    organizationName: '',
    title: '',
    totalTokens: '',
    startDate: '',
    endDate: '',
    time: '',
    location: '',
    serviceTypes: []
  });
  const [currentService, setCurrentService] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [newEvent, setNewEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState('');

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      alert('End date must be the same as or later than start date.');
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
        title: '',
        totalTokens: '',
        startDate: '',
        endDate: '',
        time: '',
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
                <label htmlFor="time">Time</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
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

          <table className="events-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Name</th>
                <th>Event Title</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Time</th>
                <th>Location</th>
                <th>Total Tokens</th>
                <th>Available</th>
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
                    return (
                      <>
                  <td>{event.organizationType}</td>
                  <td>{event.organizationName || '-'}</td>
                  <td style={{ fontWeight: 600 }}>{event.title}</td>
                  <td>{startDate ? new Date(startDate).toLocaleDateString() : '-'}</td>
                  <td>{endDate ? new Date(endDate).toLocaleDateString() : '-'}</td>
                  <td>{event.time}</td>
                  <td>{event.location}</td>
                  <td>{event.totalTokens ?? '-'}</td>
                  <td>{event.availableTokens ?? '-'}</td>
                  <td>
                    <span className={`badge ${event.status === 'Upcoming' ? 'badge-yellow' :
                        event.status === 'Ongoing' ? 'badge-green' : 'badge-red'
                      }`}>
                      {event.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={deletingEventId === event.id}
                      style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                    >
                      {deletingEventId === event.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                      </>
                    );
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default EventScheduler;

