import React from 'react';
import '../../styles/admin.css';

const Sidebar = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'queue-management', label: 'Queue Management', icon: '📋' },
    { id: 'event-scheduler', label: 'Event Scheduler', icon: '📅' },
    { id: 'counter-management', label: 'Counters', icon: '🏢' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'predictions', label: 'Predictions', icon: '🔮' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-title">Smart'Q Admin</div>
      </div>
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

