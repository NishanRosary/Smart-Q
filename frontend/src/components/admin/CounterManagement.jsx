import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../shared/Sidebar';
import axios from 'axios';
import socket from '../../socket';
import '../../styles/admin.css';
import '../../styles/global.css';

const CounterManagement = ({ onNavigate, goBack, currentPage }) => {
  const [queueData, setQueueData] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingByCounter, setLoadingByCounter] = useState({});

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  const fetchQueueData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/queue', getAuthConfig());
      setQueueData(res.data || []);
    } catch (err) {
      console.error('Error fetching queue:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events', getAuthConfig());
      setEvents(res.data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  useEffect(() => {
    fetchQueueData();
    fetchEvents();

    socket.on('queue:update', (data) => {
      if (Array.isArray(data.queue)) {
        setQueueData(data.queue);
      }
    });

    return () => {
      socket.off('queue:update');
    };
  }, []);

  const normalize = (value) => String(value || '').trim().toLowerCase();

  const eventIdToOrgMap = useMemo(() => {
    const map = new Map();
    events.forEach((event) => {
      map.set(Number(event.id), normalize(event.organizationName));
    });
    return map;
  }, [events]);

  const eventNameToOrgMap = useMemo(() => {
    const map = new Map();
    events.forEach((event) => {
      map.set(normalize(event.title), normalize(event.organizationName));
    });
    return map;
  }, [events]);

  const organizations = useMemo(() => {
    const grouped = new Map();

    events.forEach((event) => {
      const orgName = event.organizationName || 'Unknown Organization';
      const orgKey = normalize(orgName);
      if (!grouped.has(orgKey)) {
        grouped.set(orgKey, {
          organizationName: orgName,
          services: new Set(),
        });
      }
      const current = grouped.get(orgKey);
      (event.serviceTypes || []).forEach((service) => {
        if (service) current.services.add(service);
      });
    });

    return Array.from(grouped.values()).map((org) => ({
      organizationName: org.organizationName,
      counters: Array.from(org.services).sort((a, b) => a.localeCompare(b)),
    }));
  }, [events]);

  const sortedByQueueOrder = (items) =>
    [...items].sort((a, b) => {
      if (typeof a.tokenNumber === 'number' && typeof b.tokenNumber === 'number') {
        return a.tokenNumber - b.tokenNumber;
      }
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });

  const resolveTokenOrg = (token) => {
    const directOrg = normalize(token.organizationName);
    if (directOrg) return directOrg;

    const fromEventId = token.eventId !== undefined && token.eventId !== null
      ? eventIdToOrgMap.get(Number(token.eventId))
      : '';
    if (fromEventId) return fromEventId;

    const fromEventName = eventNameToOrgMap.get(normalize(token.eventName));
    if (fromEventName) return fromEventName;

    return '';
  };

  const serviceMatches = (queueService, counterServiceType) => {
    const queueValue = normalize(queueService);
    const counterValue = normalize(counterServiceType);
    if (!queueValue || !counterValue) return false;
    if (queueValue === counterValue) return true;
    if (counterValue === 'general' && queueValue.includes('general')) return true;
    return queueValue.includes(counterValue) || counterValue.includes(queueValue);
  };

  const openTokens = useMemo(
    () => queueData.filter((item) => item.status === 'waiting' || item.status === 'serving'),
    [queueData]
  );

  const waitingTokens = useMemo(
    () => queueData.filter((item) => item.status === 'waiting'),
    [queueData]
  );

  const servingTokens = useMemo(
    () => queueData.filter((item) => item.status === 'serving'),
    [queueData]
  );

  const sectionCounters = useMemo(() => {
    return organizations.map((org) => {
      const orgKey = normalize(org.organizationName);

      const counters = org.counters.map((serviceType, index) => {
        const matchingWaiting = sortedByQueueOrder(
          waitingTokens.filter(
            (token) => resolveTokenOrg(token) === orgKey && serviceMatches(token.service, serviceType)
          )
        );

        const matchingServing = sortedByQueueOrder(
          servingTokens.filter(
            (token) => resolveTokenOrg(token) === orgKey && serviceMatches(token.service, serviceType)
          )
        );

        const matchingOpen = openTokens.filter(
          (token) => resolveTokenOrg(token) === orgKey && serviceMatches(token.service, serviceType)
        );

        const currentToken = matchingServing[0] || null;

        return {
          id: `${orgKey}::${normalize(serviceType)}`,
          number: `Counter ${index + 1}`,
          serviceType,
          organizationName: org.organizationName,
          waitingCount: matchingWaiting.length,
          totalTokens: matchingOpen.length,
          currentToken,
          isActive: Boolean(currentToken),
        };
      });

      return {
        organizationName: org.organizationName,
        counters,
      };
    });
  }, [organizations, waitingTokens, servingTokens, openTokens]);

  const allCounters = useMemo(
    () => sectionCounters.flatMap((section) => section.counters),
    [sectionCounters]
  );

  const totalCounters = allCounters.length;
  const activeCounters = allCounters.filter((c) => c.isActive).length;
  const idleCounters = totalCounters - activeCounters;
  const utilizationPct = totalCounters === 0 ? 0 : Math.round((activeCounters / totalCounters) * 100);

  const formatTokenNumber = (tokenNumber) => {
    if (tokenNumber === null || tokenNumber === undefined) return '--';
    const numeric = String(tokenNumber).replace(/\D/g, '');
    if (!numeric) return '--';
    return `T${numeric.padStart(3, '0')}`;
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="badge badge-green">Active</span>
    ) : (
      <span className="badge badge-yellow">Idle</span>
    );
  };

  const callNextToken = async (counter) => {
    const orgKey = normalize(counter.organizationName);
    const candidates = sortedByQueueOrder(
      waitingTokens.filter(
        (token) => resolveTokenOrg(token) === orgKey && serviceMatches(token.service, counter.serviceType)
      )
    );

    const nextToken = candidates[0];
    if (!nextToken) return;

    setLoadingByCounter((prev) => ({ ...prev, [counter.id]: true }));

    const previousQueue = queueData;
    setQueueData((prev) =>
      prev.map((token) =>
        token._id === nextToken._id
          ? {
              ...token,
              status: 'serving',
            }
          : token
      )
    );

    try {
      await axios.put(
        `http://localhost:5000/api/queue/${nextToken._id}/start`,
        {},
        getAuthConfig()
      );
      await fetchQueueData();
    } catch (error) {
      console.error('Error calling next token:', error);
      setQueueData(previousQueue);
    } finally {
      setLoadingByCounter((prev) => ({ ...prev, [counter.id]: false }));
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} goBack={goBack} />
      <main className="admin-main">
        <div className="admin-header">
          <h1>Counter Management</h1>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem', borderTop: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, color: '#1d4ed8' }}>Smart Assignment Panel</h3>
              <p style={{ margin: '0.35rem 0 0 0', color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
                Organization-wise counters generated from Event Scheduler service types
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ backgroundColor: '#2563eb', color: '#fff' }}>Total: {totalCounters}</span>
              <span className="badge badge-green">Active: {activeCounters}</span>
              <span className="badge badge-yellow">Idle: {idleCounters}</span>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--color-gray-600)', marginBottom: '0.35rem' }}>
              <span>Utilization</span>
              <span>{activeCounters}/{totalCounters} active ({utilizationPct}%)</span>
            </div>
            <div style={{ width: '100%', height: '10px', borderRadius: '999px', backgroundColor: '#e5e7eb', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${utilizationPct}%`,
                  height: '100%',
                  background: utilizationPct >= 80 ? '#dc2626' : utilizationPct >= 50 ? '#f59e0b' : '#16a34a',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        </div>

        {sectionCounters.map((section) => (
          <div key={section.organizationName} className="card" style={{ marginBottom: '1.5rem', borderTop: '4px solid #0f766e' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', color: '#0f172a' }}>{section.organizationName}</h2>
              <p style={{ margin: '0.35rem 0 0 0', color: 'var(--color-gray-500)', fontSize: '0.8125rem' }}>
                Counters created from this organization's event service types
              </p>
            </div>

            <div className="counters-grid">
              {section.counters.length === 0 ? (
                <div style={{ color: 'var(--color-gray-500)' }}>No services configured for this organization.</div>
              ) : (
                section.counters.map((counter) => {
                  const isLoading = Boolean(loadingByCounter[counter.id]);
                  const hasWaiting = counter.waitingCount > 0;

                  return (
                    <div key={counter.id} className="counter-card" style={{ borderTop: `4px solid ${counter.isActive ? '#16a34a' : '#94a3b8'}` }}>
                      <div className="counter-header">
                        <div className="counter-number">{counter.number}</div>
                        <div className="counter-status">{getStatusBadge(counter.isActive)}</div>
                      </div>

                      <div className="counter-info">
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: '0.5rem' }}>
                          Service Type: {counter.serviceType}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
                          <span className="badge badge-yellow">{counter.waitingCount} waiting</span>
                          <span className="badge" style={{ backgroundColor: '#3b82f6', color: '#fff' }}>{counter.totalTokens} total</span>
                        </div>

                        {counter.currentToken ? (
                          <div className="counter-current-token">
                            Current Token: {formatTokenNumber(counter.currentToken.tokenNumber)}
                          </div>
                        ) : (
                          <div style={{ color: '#9CA3AF' }}>No active token</div>
                        )}
                      </div>

                      <div className="counter-actions">
                        <button
                          className="action-btn btn-primary"
                          style={{ flex: 1 }}
                          disabled={!hasWaiting || isLoading}
                          onClick={() => callNextToken(counter)}
                        >
                          {isLoading ? 'Calling...' : 'Call Next Token'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default CounterManagement;
