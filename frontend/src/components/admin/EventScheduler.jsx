import React, { useState } from 'react';
import Sidebar from '../shared/Sidebar';
import QRCodeDisplay from '../shared/QRCodeDisplay';
import { getAllEvents, addEvent, organizationTypes } from '../../data/mockData';
import '../../styles/admin.css';
import '../../styles/global.css';

const EventScheduler = ({ onNavigate, goBack, currentPage }) => {
  const [formData, setFormData] = useState({
    organizationType: '',
    title: '',
    date: '',
    time: '',
    location: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [newEvent, setNewEvent] = useState(null);
  const events = getAllEvents();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const event = addEvent(formData);
    setNewEvent(event);
    setShowSuccess(true);
    setFormData({
      organizationType: '',
      title: '',
      date: '',
      time: '',
      location: ''
    });
    setTimeout(() => setShowSuccess(false), 5000);
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
                  {organizationTypes.map(type => (
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
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
                <th>Event Title</th>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id}>
                  <td>{event.organizationType}</td>
                  <td style={{ fontWeight: 600 }}>{event.title}</td>
                  <td>{new Date(event.date).toLocaleDateString()}</td>
                  <td>{event.time}</td>
                  <td>{event.location}</td>
                  <td>
                    <span className={`badge ${
                      event.status === 'Upcoming' ? 'badge-yellow' : 
                      event.status === 'Ongoing' ? 'badge-green' : 'badge-red'
                    }`}>
                      {event.status}
                    </span>
                  </td>
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

