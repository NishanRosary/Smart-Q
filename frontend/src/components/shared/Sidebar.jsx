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
        <div className="admin-sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img
            src="/favicon.jpg"
            alt="Smart'Q"
            style={{
              height: '28px',
              width: '28px',
              borderRadius: '8px',
              objectFit: 'cover',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(37, 99, 235, 0.15)',
            }}
          />
          <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-primary-dark)', letterSpacing: '-0.02em' }}>Smart'Q</span>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginLeft: '2px', padding: '2px 6px', borderRadius: '4px', background: 'var(--color-gray-100)' }}>Admin</span>
        </div>
      </div>



      {showBackButton && goBack && (

        <div style={{ paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid #E5E7EB' }}>
          <button
            onClick={goBack}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'var(--color-gray-50)',
              border: '1px solid var(--color-gray-200)',
              borderRadius: '8px',
              color: 'var(--color-gray-700)',
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
              e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
              e.currentTarget.style.color = 'var(--color-gray-900)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
              e.currentTarget.style.color = 'var(--color-gray-700)';
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

