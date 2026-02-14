import React, { useState } from 'react';
import Header from '../shared/Header';
import QRCodeDisplay from '../shared/QRCodeDisplay';
import { getEvents, customerQueueStatus, mlPredictions } from '../../data/mockData';
import '../../styles/customer.css';
import {
  Brain,
  Clock,
  AlertTriangle,
  BarChart2,
  Calendar,
  MapPin,
  Smartphone,
  QrCode,
  Info
} from 'lucide-react';

const CustomerDashboard = ({ onNavigate, goBack, currentPage }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const events = getEvents();

  const getCrowdLevelColor = (level) => {
    switch (level) {
      case 'Low':
        return 'badge-green';
      case 'Medium':
        return 'badge-yellow';
      case 'High':
        return 'badge-red';
      default:
        return 'badge-green';
    }
  };

  const getCrowdLevelBadge = (level) => {
    return <span className={`badge ${getCrowdLevelColor(level)}`}>{level}</span>;
  };

  const handleQRClick = (event) => {
    setSelectedEvent(event);
    setShowQRModal(true);
  };

  const handleJoinQueue = (event) => {
    // Navigate to join queue page with event pre-selected
    onNavigate('join-queue', { event, isCustomer: true });
  };

  return (
    <div>
      <Header onNavigate={onNavigate} goBack={goBack} currentPage={currentPage} />
      <div className="dashboard-container">
        {/* Queue Status Section */}
        <div className="dashboard-section">
          <div className="queue-status-card">
            <div className="queue-position">{customerQueueStatus.position}</div>
            <div className="queue-label">Your Position in Queue</div>

            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${(customerQueueStatus.position / 50) * 100}%` }}
              ></div>
            </div>

            <div className="queue-info">
              <div className="queue-info-item">
                <span className="queue-info-label">Estimated Waiting Time</span>
                <span className="queue-info-value">{customerQueueStatus.estimatedWaitTime} minutes</span>
              </div>
              <div className="queue-info-item">
                <span className="queue-info-label">Crowd Level</span>
                <span className="queue-info-value">
                  {getCrowdLevelBadge(customerQueueStatus.crowdLevel)}
                </span>
              </div>
              <div className="queue-info-item">
                <span className="queue-info-label">Token Number</span>
                <span className="queue-info-value">{customerQueueStatus.tokenNumber}</span>
              </div>
              <div className="queue-info-item">
                <span className="queue-info-label">Service</span>
                <span className="queue-info-value">{customerQueueStatus.service}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ML Predictions Section */}
        <div className="dashboard-section">
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Brain size={32} color="var(--color-primary)" /> AI-Powered Predictions
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {/* Optimal Visit Times */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, var(--color-primary-bg) 0%, var(--color-white) 100%)',
              border: '2px solid var(--color-primary)'
            }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} /> Best Times to Visit
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {mlPredictions.optimalVisitTimes.map((item, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-white)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-gray-200)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{item.time}</span>
                      <span className="badge badge-green">{item.score}% Score</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
                      Wait: {item.waitTime} min • Crowd: {item.crowdLevel}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak Time Warnings */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, var(--color-yellow-bg) 0%, var(--color-white) 100%)',
              border: '2px solid var(--color-yellow)'
            }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} color="var(--color-red)" /> Peak Times to Avoid
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {mlPredictions.peakTimes.filter(p => p.prediction === 'High').slice(0, 3).map((item, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-white)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-yellow-light)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{item.hour}</span>
                      <span className="badge badge-red">High</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
                      {item.customers} customers expected ({item.confidence}% confidence)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wait Time Forecast */}
            <div className="card" style={{
              background: 'linear-gradient(135deg, var(--color-green-bg) 0%, var(--color-white) 100%)',
              border: '2px solid var(--color-green-light)'
            }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--color-gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart2 size={20} /> Wait Time Forecast
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {mlPredictions.waitTimePredictions.map((item, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-white)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-green-bg)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.time}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
                          Predicted: {item.predictedWait} min
                        </div>
                      </div>
                      <div style={{
                        padding: '0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: item.accuracy >= 90 ? 'var(--color-green-bg)' : 'var(--color-yellow-bg)',
                        color: item.accuracy >= 90 ? 'var(--color-green)' : 'var(--color-yellow)'
                      }}>
                        {item.accuracy}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Events Section */}
        <div className="dashboard-section">
          <h2 className="section-title">Scheduled Events</h2>
          <div className="events-grid">
            {events.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <span className="event-organization" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{event.organizationName}</span>
                    <span style={{ opacity: 0.8, fontSize: '0.8rem' }}>({event.organizationType})</span>
                  </span>
                  {getCrowdLevelBadge(event.crowdLevel)}
                </div>
                <h3 className="event-title">{event.title}</h3>
                <div className="event-details">
                  <div className="event-detail-item">
                    <span><Calendar size={16} /></span>
                    <span>{new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="event-detail-item">
                    <span><Clock size={16} /></span>
                    <span>{event.time}</span>
                  </div>
                  <div className="event-detail-item">
                    <span><MapPin size={16} /></span>
                    <span>{event.location}</span>
                  </div>
                  <div className="event-detail-item">
                    <span><Info size={16} /></span>
                    <span>Status: {event.status}</span>
                  </div>
                </div>
                <div className="event-actions">
                  <button
                    className="btn-primary"
                    onClick={() => handleJoinQueue(event)}
                    style={{ flex: 1 }}
                  >
                    Join Queue
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => handleQRClick(event)}
                  >
                    <QrCode size={16} /> QR Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedEvent && (
        <div className="qr-code-modal" onClick={() => setShowQRModal(false)}>
          <div className="qr-code-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="qr-code-modal-close"
              onClick={() => setShowQRModal(false)}
            >
              ×
            </button>
            <h3 style={{ marginBottom: '1rem' }}>Scan QR Code to Book Slot</h3>
            <QRCodeDisplay eventData={selectedEvent} size={250} />
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
              {selectedEvent.title}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
              {selectedEvent.date} at {selectedEvent.time}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;

