import React, { useState, useEffect, useCallback } from 'react';
import Header from '../shared/Header';
import QRCodeDisplay from '../shared/QRCodeDisplay';
import { getEvents } from '../../data/mockData';
import { onQueueUpdate, getQueueStatus, connectSocket, disconnectSocket } from '../../services/queueService';
import '../../styles/customer.css';
import {
  Brain,
  Clock,
  AlertTriangle,
  BarChart2,
  Calendar,
  MapPin,
  QrCode,
  Info,
  TrendingDown,
  TrendingUp,
  Activity,
  Users,
  Timer,
  Zap,
  RefreshCw
} from 'lucide-react';

const normalizeTokenNumber = (tokenValue) => {
  if (tokenValue === null || tokenValue === undefined) return null;
  const numeric = String(tokenValue).replace(/\D/g, '');
  if (!numeric) return null;
  return Number.parseInt(numeric, 10);
};

const formatTokenNumber = (tokenValue) => {
  const tokenNumber = normalizeTokenNumber(tokenValue);
  if (tokenNumber === null || Number.isNaN(tokenNumber)) return '--';
  return `T${String(tokenNumber).padStart(3, '0')}`;
};

const CustomerDashboard = ({ onNavigate, goBack, currentPage, customerData, onLogout }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [queueStatus, setQueueStatus] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeToken, setActiveToken] = useState(() => localStorage.getItem('smartq-active-token'));
  const [activeService, setActiveService] = useState(() => localStorage.getItem('smartq-active-service'));
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const events = getEvents();

  // Fetch queue status from backend
  const fetchQueueStatus = useCallback(async () => {
    const token = activeToken || localStorage.getItem('smartq-active-token');
    const normalizedToken = normalizeTokenNumber(token);
    if (!normalizedToken) return;

    setIsRefreshing(true);
    try {
      const data = await getQueueStatus(normalizedToken);
      setQueueStatus({
        position: data.position,
        estimatedWaitTime: data.estimatedWaitTime,
        crowdLevel: data.crowdLevel,
        tokenNumber: formatTokenNumber(data.tokenNumber),
        service: data.service,
        status: data.status,
        totalWaiting: data.totalWaiting
      });
      if (data.predictions) {
        setPredictions(data.predictions);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch queue status:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [activeToken]);

  // Monitor localStorage for token changes
  useEffect(() => {
    const checkToken = () => {
      const storedToken = localStorage.getItem('smartq-active-token');
      const storedService = localStorage.getItem('smartq-active-service');
      if (storedToken && storedToken !== activeToken) {
        setActiveToken(storedToken);
      }
      if (storedService && storedService !== activeService) {
        setActiveService(storedService);
      }
    };

    // Check immediately
    checkToken();

    // Check periodically (every 1 second) for newly joined queue
    const interval = setInterval(checkToken, 1000);
    
    // Also listen for storage events (changes from other tabs)
    window.addEventListener('storage', checkToken);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkToken);
    };
  }, [activeToken, activeService]);

  // Setup Socket.IO for real-time updates
  useEffect(() => {
    if (!activeToken) return;

    connectSocket();
    setIsLive(true);

    const unsubscribe = onQueueUpdate((data) => {
      // Find my entry in the updated queue
      const tokenNum = normalizeTokenNumber(activeToken);
      if (!tokenNum) return;
      const myEntry = data.queue.find(q => q.tokenNumber === tokenNum);

      if (myEntry) {
        setQueueStatus({
          position: myEntry.position,
          estimatedWaitTime: myEntry.estimatedWaitTime,
          crowdLevel: myEntry.crowdLevel || data.crowdLevel,
          tokenNumber: formatTokenNumber(myEntry.tokenNumber),
          service: myEntry.service,
          status: myEntry.status,
          totalWaiting: data.totalWaiting
        });
      } else {
        // Token might be completed or serving
        const servingEntry = data.serving?.find(q => q.tokenNumber === tokenNum);
        if (servingEntry) {
          setQueueStatus(prev => ({
            ...prev,
            position: 0,
            estimatedWaitTime: 0,
            status: 'serving',
            crowdLevel: data.crowdLevel,
            totalWaiting: data.totalWaiting
          }));
        }
      }
      setLastUpdated(new Date());
    });

    // Initial fetch
    fetchQueueStatus();

    // Periodic poll as backup
    const interval = setInterval(fetchQueueStatus, 15000);

    return () => {
      unsubscribe();
      clearInterval(interval);
      disconnectSocket();
      setIsLive(false);
    };
  }, [activeToken, fetchQueueStatus]);

  const getCrowdLevelColor = (level) => {
    switch (level) {
      case 'Low': return 'badge-green';
      case 'Medium': return 'badge-yellow';
      case 'High': return 'badge-red';
      default: return 'badge-green';
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
    onNavigate('join-queue', { event, isCustomer: true });
  };

  // Use real data or fallback
  const displayStatus = queueStatus || {
    position: '--',
    estimatedWaitTime: '--',
    crowdLevel: 'Low',
    tokenNumber: '--',
    service: activeService || 'N/A',
    totalWaiting: '--'
  };

  const displayPredictions = predictions || null;

  return (
    <div>
      <Header onNavigate={onNavigate} goBack={goBack} currentPage={currentPage} customerData={customerData} onLogout={onLogout} />
      <div className="dashboard-container">
        {/* Queue Status Section */}
        {activeToken ? (
          <div className="dashboard-section">
            {/* Live Indicator */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: isLive ? '#22c55e' : '#ef4444',
                  animation: isLive ? 'pulse 2s infinite' : 'none',
                  boxShadow: isLive ? '0 0 6px #22c55e' : 'none'
                }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: isLive ? '#22c55e' : '#ef4444' }}>
                  {isLive ? 'LIVE' : 'OFFLINE'}
                </span>
                {lastUpdated && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)' }}>
                    • Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </div>
              <button
                onClick={fetchQueueStatus}
                disabled={isRefreshing}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  background: 'var(--color-primary)', border: 'none',
                  borderRadius: '8px', padding: '0.5rem 1rem', cursor: isRefreshing ? 'not-allowed' : 'pointer',
                  fontSize: '0.8125rem', color: 'white', fontWeight: 600,
                  opacity: isRefreshing ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} /> 
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {/* Serving Notification */}
            {displayStatus.status === 'serving' && (
              <div style={{
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                borderRadius: '12px',
                color: '#fff',
                textAlign: 'center',
                marginBottom: '1.5rem',
                animation: 'fadeInDown 0.5s ease',
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)'
              }}>
                <Zap size={28} style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>It's Your Turn!</div>
                <div style={{ opacity: 0.9, fontSize: '0.875rem' }}>Please proceed to the counter now</div>
              </div>
            )}

            {/* Main Queue Position Card */}
            <div className="queue-status-card">
              <div className="queue-position" style={{
                fontSize: typeof displayStatus.position === 'number' && displayStatus.position > 0 ? '3.5rem' : '2rem',
                transition: 'all 0.5s ease'
              }}>
                {displayStatus.status === 'serving' ? '🎉' :
                  displayStatus.status === 'completed' ? '✅' :
                    displayStatus.position}
              </div>
              <div className="queue-label">
                {displayStatus.status === 'serving' ? 'Now Serving You!' :
                  displayStatus.status === 'completed' ? 'Service Completed' :
                    'Your Position in Queue'}
              </div>

              {typeof displayStatus.position === 'number' && displayStatus.position > 0 && (
                <div className="progress-bar-container" style={{ marginTop: '1rem' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.max(5, 100 - ((displayStatus.position / Math.max(displayStatus.totalWaiting, 1)) * 100))}%`,
                      transition: 'width 0.8s ease'
                    }}
                  ></div>
                </div>
              )}

              <div className="queue-info" style={{ marginTop: '1.5rem' }}>
                <div className="queue-info-item">
                  <span className="queue-info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Timer size={14} /> Estimated Waiting
                  </span>
                  <span className="queue-info-value" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                    {displayStatus.estimatedWaitTime} {typeof displayStatus.estimatedWaitTime === 'number' ? 'minutes' : ''}
                  </span>
                </div>
                <div className="queue-info-item">
                  <span className="queue-info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Users size={14} /> Crowd Level
                  </span>
                  <span className="queue-info-value">
                    {getCrowdLevelBadge(displayStatus.crowdLevel)}
                  </span>
                </div>
                <div className="queue-info-item">
                  <span className="queue-info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Activity size={14} /> Token Number
                  </span>
                  <span className="queue-info-value" style={{ fontWeight: 700, color: 'var(--color-white)' }}>
                    {displayStatus.tokenNumber}
                  </span>
                </div>
                <div className="queue-info-item">
                  <span className="queue-info-label">Service</span>
                  <span className="queue-info-value">{displayStatus.service}</span>
                </div>
                {typeof displayStatus.totalWaiting === 'number' && (
                  <div className="queue-info-item">
                    <span className="queue-info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Users size={14} /> Total in Queue
                    </span>
                    <span className="queue-info-value" style={{ fontWeight: 700 }}>
                      {displayStatus.totalWaiting}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-section">
            <div className="queue-status-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '0.5rem' }}>
                No Active Queue
              </div>
              <div style={{ color: 'var(--color-gray-500)', marginBottom: '1.5rem' }}>
                Join an event queue below to start tracking your position in real-time
              </div>
            </div>
          </div>
        )}

        {/* ML Predictions Section */}
        {displayPredictions && activeToken && (
          <div className="dashboard-section">
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Brain size={32} color="var(--color-primary)" /> AI-Powered Predictions
              <span style={{
                fontSize: '0.6875rem',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                color: '#fff',
                padding: '0.2rem 0.6rem',
                borderRadius: '20px',
                fontWeight: 700,
                letterSpacing: '0.04em'
              }}>ML ENGINE</span>
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
                  {(displayPredictions.optimalVisitTimes ?? []).map((item, index) => (
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
                  {(displayPredictions.peakTimes ?? []).filter(p => p.prediction === 'High').slice(0, 3).map((item, index) => (
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
                  {(displayPredictions.peakTimes ?? []).filter(p => p.prediction === 'High').length === 0 && (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                      <TrendingDown size={24} style={{ marginBottom: '0.5rem' }} />
                      <br />No peak hours detected right now
                    </div>
                  )}
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
                  {(displayPredictions.waitTimePredictions ?? []).map((item, index) => (
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

            {/* ML Model Stats Bar */}
            {displayPredictions.mlModelStats && (
              <div style={{
                display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
                padding: '1rem 1.5rem',
                background: 'var(--color-gray-50)',
                borderRadius: '12px',
                border: '1px solid var(--color-gray-200)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Brain size={16} color="var(--color-primary)" />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)' }}>Model Accuracy:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-gray-900)' }}>{displayPredictions.mlModelStats.modelAccuracy}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={16} color="var(--color-green)" />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)' }}>Predictions Today:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-gray-900)' }}>{displayPredictions.mlModelStats.predictionsToday}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={16} color="var(--color-primary)" />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray-500)' }}>Last Updated:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-gray-900)' }}>{displayPredictions.mlModelStats.lastUpdated}</span>
                </div>
              </div>
            )}
          </div>
        )}

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
                      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
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
