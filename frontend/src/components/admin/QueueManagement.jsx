import React from 'react';
import Sidebar from '../shared/Sidebar';
import { queueData } from '../../data/mockData';
import '../../styles/admin.css';
import '../../styles/global.css';

const QueueManagement = ({ onNavigate, currentPage }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Waiting':
        return <span className="badge badge-yellow">Waiting</span>;
      case 'In Progress':
        return <span className="badge badge-green">In Progress</span>;
      case 'Completed':
        return <span className="badge badge-red">Completed</span>;
      default:
        return <span className="badge badge-yellow">{status}</span>;
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <main className="admin-main">
        <div className="admin-header">
          <h1>Queue Management</h1>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>Active Queues</h3>
              <p style={{ margin: '0.5rem 0 0 0', color: '#6B7280', fontSize: '0.875rem' }}>
                Manage and monitor all queue entries
              </p>
            </div>
            <button className="btn-primary">
              + Add to Queue
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <table className="queue-table">
            <thead>
              <tr>
                <th>Token Number</th>
                <th>Customer Name</th>
                <th>Service</th>
                <th>Joined At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queueData.map((queue, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 600, color: '#3B82F6' }}>{queue.tokenNumber}</td>
                  <td>{queue.customerName}</td>
                  <td>{queue.service}</td>
                  <td>{queue.joinedAt}</td>
                  <td>{getStatusBadge(queue.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn btn-primary" style={{ fontSize: '0.75rem' }}>
                        View
                      </button>
                      <button className="action-btn btn-secondary" style={{ fontSize: '0.75rem' }}>
                        Edit
                      </button>
                      <button className="action-btn btn-danger" style={{ fontSize: '0.75rem' }}>
                        Remove
                      </button>
                    </div>
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

export default QueueManagement;

