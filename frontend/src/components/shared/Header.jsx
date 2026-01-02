import React from 'react';
import '../../styles/customer.css';

const Header = ({ onNavigate, goBack, currentPage }) => {
  const showBackButton = currentPage && currentPage !== 'landing';

  return (
    <header className="customer-header">
      <div className="customer-header-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {showBackButton && goBack && (
            <button 
              className="btn-secondary" 
              onClick={goBack}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem'
              }}
              title="Go back"
            >
              <span>←</span> Back
            </button>
          )}
          <div className="logo" onClick={() => onNavigate('landing')} style={{ cursor: 'pointer' }}>
            Smart'Q
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <button className="nav-button" onClick={() => onNavigate('landing')}>
            Home
          </button>
          <button className="nav-button" onClick={() => onNavigate('login')}>
            Login
          </button>
          <button 
            className="nav-button" 
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

