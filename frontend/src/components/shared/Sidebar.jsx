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

  const showBackButton = currentPage && currentPage !== 'admin-login';

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-title">Smart'Q Admin</div>
      </div>

      {showBackButton && goBack && (
        
        <div style={{ paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid #E5E7EB' }}>
          <button
            onClick={goBack}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              color: '#374151',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#E5E7EB';
              e.currentTarget.style.color = '#111827';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F6';
              e.currentTarget.style.color = '#374151';
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

