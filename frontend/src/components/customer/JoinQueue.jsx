import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../shared/Header";
import "../../styles/customer.css";
import {
  Calendar,
  Clock,
  MapPin,
  Info,
  User,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle,
  Building2,
  ChevronRight,
  Shield,
  Activity
} from 'lucide-react';

const formatTokenNumber = (tokenValue) => {
  const numeric = String(tokenValue ?? '').replace(/\D/g, '');
  if (!numeric) return '--';
  return `T${numeric.padStart(3, '0')}`;
};

const JoinQueue = ({ onNavigate, goBack, currentPage, eventData, customerData }) => {
  const [step, setStep] = useState(1); // 1: Events, 2: Guest Details, 3: Service Selection, 4: Status
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [guestDetails, setGuestDetails] = useState({ name: '', email: '', otp: '' });
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        setEvents(response.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const availableServices = selectedEvent?.serviceTypes && selectedEvent.serviceTypes.length > 0
    ? selectedEvent.serviceTypes
    : [];

  useEffect(() => {
    if (eventData && eventData.event) {
      setSelectedEvent(eventData.event);
      if (eventData.isCustomer) {
        setStep(3);
      } else {
        setStep(2);
      }
    }
  }, [eventData]);

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

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setStep(2);
  };

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    if (guestDetails.name && guestDetails.email) {
      setStep(3);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService) return;

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/queue/join", {
        service: selectedService,
        guestName: guestDetails.name || customerData?.name || "Customer",
        guestMobile: customerData?.phone || "",
        guestEmail: eventData?.isCustomer ? (customerData?.email || "") : guestDetails.email,
        isCustomerUser: Boolean(eventData?.isCustomer),
        eventId: selectedEvent.id,
        eventName: selectedEvent.title,
        organizationName: selectedEvent.organizationName,
        organizationType: selectedEvent.organizationType
      });
      // Store token for real-time tracking on dashboard
      localStorage.setItem('smartq-active-token', String(res.data.tokenNumber));
      localStorage.setItem('smartq-active-service', selectedService);
      setTokenData(res.data);
      setStep(4);
    } catch (error) {
      console.error(error);
      // Fallback for demo without backend
      const demoToken = {
        tokenNumber: Math.floor(Math.random() * 100) + 1,
        service: selectedService,
        estimatedWaitTime: 15,
        position: 1
      };
      localStorage.setItem('smartq-active-token', String(demoToken.tokenNumber));
      localStorage.setItem('smartq-active-service', selectedService);
      setTokenData(demoToken);
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedEvent(null);
    setGuestDetails({ name: '', email: '', otp: '' });
    setSelectedService('');
    setTokenData(null);
  };

  // Render Functions
  const renderProgressBar = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '3rem',
      position: 'relative',
      maxWidth: '600px',
      margin: '0 auto 3rem'
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        right: '0',
        height: '2px',
        background: 'var(--color-gray-200)',
        zIndex: 0,
        transform: 'translateY(-50%)'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        width: `${((step - 1) / 3) * 100}%`,
        height: '2px',
        background: 'var(--color-primary)',
        zIndex: 0,
        transform: 'translateY(-50%)',
        transition: 'width 0.3s ease'
      }}></div>
      {[1, 2, 3, 4].map((s) => (
        <div key={s} style={{
          zIndex: 1,
          background: step >= s ? 'var(--color-primary)' : 'var(--color-white)',
          color: step >= s ? 'var(--color-white)' : 'var(--color-gray-400)',
          border: `2px solid ${step >= s ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          margin: '0 auto', // This centers strictly if in flex, but we want distributed
          position: 'absolute',
          left: `${((s - 1) / 3) * 100}%`,
          transform: 'translateX(-50%)',
          transition: 'all 0.3s ease'
        }}>
          {step > s ? <CheckCircle size={20} /> : s}
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <Header onNavigate={onNavigate} goBack={goBack} currentPage={currentPage} />

      {/* Customer Logged In View */}
      {eventData?.isCustomer ? (
        <div className="join-queue-container" style={{ maxWidth: '600px', padding: '3rem 1rem' }}>
          {step === 3 && (
            <div className="card">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '0.5rem' }}>
                  Select Service
                </h2>
                <p style={{ color: 'var(--color-gray-500)' }}>
                  For {selectedEvent?.title}
                </p>
              </div>

              <form onSubmit={handleServiceSubmit}>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  {availableServices.map((service, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedService(service)}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        border: selectedService === service ? '2px solid var(--color-primary)' : '1px solid var(--color-gray-200)',
                        background: selectedService === service ? 'var(--color-primary-bg)' : 'var(--color-white)',
                        marginBottom: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ fontWeight: 500, color: selectedService === service ? 'var(--color-primary)' : 'var(--color-gray-700)' }}>{service}</span>
                      {selectedService === service && <CheckCircle size={20} color="var(--color-primary)" />}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => onNavigate('customer-dashboard')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--color-gray-200)',
                      cursor: 'pointer',
                      fontWeight: 500,
                      backgroundColor: 'var(--color-white)',
                      color: 'var(--color-gray-700)',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 1 }}
                    disabled={!selectedService || loading}
                  >
                    {loading ? "Joining..." : "Join Queue"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 4 && tokenData && (
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div className="token-card">
                <div className="token-number">{formatTokenNumber(tokenData.tokenNumber)}</div>
                <div className="token-label">Queue Token</div>

                <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '8px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ opacity: 0.8 }}>Event:</span>
                    <span style={{ fontWeight: 600 }}>{selectedEvent?.title}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ opacity: 0.8 }}>Service:</span>
                    <span style={{ fontWeight: 600 }}>{tokenData.service}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.8 }}>Est. Wait:</span>
                    <span style={{ fontWeight: 600 }}>{tokenData.estimatedWaitTime ?? tokenData.estimatedWait ?? 15} mins</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <button
                  className="btn-primary"
                  onClick={() => onNavigate('customer-dashboard')}
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Guest Flow View */
        <div className="join-queue-container" style={{ maxWidth: '1000px', padding: '2rem 1rem' }}>

          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2rem', color: 'var(--color-gray-900)', fontWeight: 800 }}>
              {step === 1 ? 'Select an Event' :
                step === 2 ? 'Guest Details' :
                  step === 3 ? 'Select Service' :
                    'Queue Status'}
            </h1>
            <p style={{ color: 'var(--color-gray-500)', marginTop: '0.5rem' }}>
              {step === 1 ? 'Choose an upcoming event to join' :
                step === 2 ? 'Please provide your contact information' :
                  step === 3 ? 'Choose the service you need' :
                    'You have successfully joined the queue'}
            </p>
          </div>

          {renderProgressBar()}

          {/* Step 1: Events List */}
          {step === 1 && (
            <div className="events-grid">
              {events.map(event => (
                <div key={event.id} className="event-card" style={{ cursor: 'pointer', border: selectedEvent?.id === event.id ? '2px solid var(--color-primary)' : 'transparent' }} onClick={() => handleEventSelect(event)}>
                  <div className="event-header">
                    <span className="event-organization" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={16} />
                      <span style={{ fontWeight: 700 }}>{event.organizationName}</span>
                      <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>({event.organizationType})</span>
                    </span>
                    {getCrowdLevelBadge(event.crowdLevel)}
                  </div>
                  <h3 className="event-title">{event.title}</h3>
                  <div className="event-details">
                    <div className="event-detail-item">
                      <span><Calendar size={16} /></span>
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="event-detail-item">
                      <span><Clock size={16} /></span>
                      <span>{event.time}</span>
                    </div>
                    <div className="event-detail-item">
                      <span><MapPin size={16} /></span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <button className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                    Join This Event <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Guest Details */}
          {step === 2 && selectedEvent && (
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
              <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--color-gray-50)', borderRadius: '8px', borderLeft: '4px solid var(--color-primary)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>Joining Event</div>
                <div style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>{selectedEvent.title}</div>
              </div>

              <form onSubmit={handleGuestSubmit}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--color-gray-700)' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-gray-400)' }} />
                    <input
                      type="text"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 10px 10px 40px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-gray-200)',
                        fontSize: '1rem'
                      }}
                      placeholder="Enter your name"
                      value={guestDetails.name}
                      onChange={(e) => setGuestDetails({ ...guestDetails, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--color-gray-700)' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-gray-400)' }} />
                    <input
                      type="email"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 10px 10px 40px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-gray-200)',
                        fontSize: '1rem'
                      }}
                      placeholder="Enter email address"
                      value={guestDetails.email}
                      onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  Continue <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    marginTop: '1rem',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-gray-500)',
                    cursor: 'pointer'
                  }}>
                  Back to Events
                </button>
              </form>
            </div>
          )}

          {/* Step 3: Service Selection */}
          {step === 3 && (
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-gray-900)' }}>Select Service</h3>

              <form onSubmit={handleServiceSubmit}>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  {availableServices.map((service, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedService(service)}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        border: selectedService === service ? '2px solid var(--color-primary)' : '1px solid var(--color-gray-200)',
                        background: selectedService === service ? 'var(--color-primary-bg)' : 'var(--color-white)',
                        marginBottom: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ fontWeight: 500, color: selectedService === service ? 'var(--color-primary)' : 'var(--color-gray-700)' }}>{service}</span>
                      {selectedService === service && <CheckCircle size={20} color="var(--color-primary)" />}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%' }}
                  disabled={!selectedService || loading}
                >
                  {loading ? "Joining Queue..." : "Join Queue"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (eventData?.isCustomer) {
                      onNavigate('customer-dashboard');
                    } else {
                      setStep(2);
                    }
                  }}
                  style={{
                    marginTop: '1rem',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-gray-500)',
                    cursor: 'pointer'
                  }}>
                  Back
                </button>
              </form>
            </div>
          )}

          {/* Step 4: Token Status */}
          {step === 4 && tokenData && (
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div className="token-card">
                <div className="token-number">{formatTokenNumber(tokenData.tokenNumber)}</div>
                <div className="token-label">Your Queue Token</div>

                <div style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '8px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ opacity: 0.8 }}>Name:</span>
                    <span style={{ fontWeight: 600 }}>{guestDetails.name || (eventData?.isCustomer ? 'Logged In User' : 'Guest')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ opacity: 0.8 }}>Event:</span>
                    <span style={{ fontWeight: 600 }}>{selectedEvent?.title}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ opacity: 0.8 }}>Service:</span>
                    <span style={{ fontWeight: 600 }}>{tokenData.service}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.8 }}>Est. Wait:</span>
                    <span style={{ fontWeight: 600 }}>{tokenData.estimatedWaitTime ?? tokenData.estimatedWait ?? 15} mins</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: "2rem" }}>
                <button
                  className="btn-secondary"
                  style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                  onClick={resetFlow}
                >
                  Join Another Queue
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default JoinQueue;
