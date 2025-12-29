import React from 'react';
import '../../styles/customer.css';

const Header = ({ onNavigate }) => {
  return (
    <header className="customer-header">
      <div className="customer-header-content">
        <div className="logo" onClick={() => onNavigate('landing')} style={{ cursor: 'pointer' }}>
          Smart'Q
        </div>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={() => onNavigate('landing')}>
            Home
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('login')}>
            Login
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => onNavigate('admin-login')}
            style={{ fontSize: '0.875rem' }}
          >
            Admin
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

