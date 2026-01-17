import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  Building2,
  TrendingUp,
  Brain,
  Settings,
  ArrowLeft
} from 'lucide-react';
import '../../styles/admin.css';

const Sidebar = ({ currentPage, onNavigate, goBack }) => {
  const navItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'queue-management', label: 'Queue Management', icon: <ClipboardList size={20} /> },
    { id: 'event-scheduler', label: 'Event Scheduler', icon: <Calendar size={20} /> },
    { id: 'counter-management', label: 'Counters', icon: <Building2 size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={20} /> },
    { id: 'predictions', label: 'Predictions', icon: <Brain size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

  const showBackButton = currentPage && currentPage !== 'admin-dashboard' && currentPage !== 'admin-login';

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-title">Smart'Q Admin</div>
      </div>
      {showBackButton && goBack && (
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={goBack}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            title="Go back"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      )}
      <nav>
        <ul className="admin-nav">
          {navItems.map(item => (
            <li key={item.id} className="admin-nav-item">
              <a
                href="#"
                className={`admin-nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
              >
                <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

