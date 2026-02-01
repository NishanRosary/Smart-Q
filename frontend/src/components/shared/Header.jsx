import React, { useState, useEffect } from 'react';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import '../../styles/customer.css';

const Header = ({ onNavigate, goBack, currentPage }) => {
  const showBackButton = currentPage && currentPage !== 'landing';
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('smartq-theme');
    // Default to 'light' if no preference is saved, per user request
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('smartq-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

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
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div className="logo" onClick={() => onNavigate('landing')} style={{ cursor: 'pointer' }}>
            Smart'Q
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className="nav-button"
            onClick={toggleTheme}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}
            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
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

