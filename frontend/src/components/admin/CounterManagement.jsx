import React from 'react';
import Sidebar from '../shared/Sidebar';
import { counterData } from '../../data/mockData';
import '../../styles/admin.css';
import '../../styles/global.css';

const CounterManagement = ({ onNavigate, goBack, currentPage }) => {
  const getStatusBadge = (status) => {
    return status === 'Active' ? (
      <span className="badge badge-green">Active</span>
    ) : (
      <span className="badge badge-red">Inactive</span>
    );
  };

  return (
    <div className="admin-layout">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} goBack={goBack} />
      <main className="admin-main">
        <div className="admin-header">
          <h1>Counter Management</h1>
        </div>

        <button className="add-counter-btn">
          + Add New Counter
        </button>

        <div className="counters-grid">
          {counterData.map(counter => (
            <div key={counter.id} className="counter-card">
              <div className="counter-header">
                <div className="counter-number">{counter.number}</div>
                <div className="counter-status">
                  {getStatusBadge(counter.status)}
                </div>
              </div>
              <div className="counter-info">
                <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: '0.5rem' }}>
                  Service Type: {counter.serviceType}
                </div>
                {counter.currentToken ? (
                  <div className="counter-current-token">
                    Current Token: {counter.currentToken}
                  </div>
                ) : (
                  <div style={{ color: '#9CA3AF' }}>No active token</div>
                )}
              </div>
              <div className="counter-actions">
                <button className="action-btn btn-primary" style={{ flex: 1 }}>
                  Activate
                </button>
                <button className="action-btn btn-secondary" style={{ flex: 1 }}>
                  Edit
                </button>
                <button className="action-btn btn-danger">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CounterManagement;

