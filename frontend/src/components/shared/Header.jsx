import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Moon, Sun, User, Mail, Phone, LogOut } from 'lucide-react';
import '../../styles/customer.css';

const Header = ({ onNavigate, goBack, currentPage, customerData, onLogout }) => {
  const showBackButton = currentPage && currentPage !== 'landing';
  const [theme, setTheme] = useState('light');
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const isLoggedIn = !!customerData;

  useEffect(() => {
    const savedTheme = localStorage.getItem('smartq-theme');
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('smartq-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    setShowProfile(false);
    if (onLogout) onLogout();
    if (onNavigate) onNavigate('login');
  };
  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
          <div
            className="logo-container"
            onClick={() => onNavigate('landing')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              transition: 'transform 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img
              src={theme === 'dark' ? "/Smart'Q dark theme.jpg" : "/smartq-logo.jpg"}
              alt="Smart'Q"
              style={{
                height: '36px',
                width: '36px',
                borderRadius: '10px',
                objectFit: 'contain',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                border: '1.5px solid rgba(37, 99, 235, 0.2)',
                backgroundColor: 'var(--bg-primary)',
              }}
            />
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-primary-dark)',
              letterSpacing: '-0.02em',
            }}>
              Smart'Q
            </span>
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

          {isLoggedIn ? (
            /* Profile Avatar & Dropdown */
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                  color: '#fff',
                  border: '2px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '0.02em',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  boxShadow: showProfile ? '0 0 0 3px var(--color-primary-bg)' : '0 2px 8px rgba(0,0,0,0.15)',
                  transform: showProfile ? 'scale(1.05)' : 'scale(1)'
                }}
                title="Profile"
              >
                {getInitials(customerData.name)}
              </button>

              {/* Dropdown */}
              {showProfile && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: '280px',
                  backgroundColor: 'var(--color-white)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--color-gray-200)',
                  padding: '0',
                  zIndex: 1000,
                  overflow: 'hidden',
                  animation: 'fadeInDown 0.2s ease'
                }}>
                  {/* Header Section */}
                  <div style={{
                    padding: '1.25rem 1.25rem 1rem',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem'
                  }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem',
                      flexShrink: 0,
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}>
                      {getInitials(customerData.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {customerData.name || 'Customer'}
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '2px' }}>
                        Customer Account
                      </div>
                    </div>
                  </div>

                  {/* Info Items */}
                  <div style={{ padding: '0.75rem 1.25rem' }}>
                    {customerData.email && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.625rem 0',
                        borderBottom: '1px solid var(--color-gray-100)'
                      }}>
                        <Mail size={16} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {customerData.email}
                        </span>
                      </div>
                    )}
                    {customerData.phone && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.625rem 0',
                      }}>
                        <Phone size={16} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)' }}>
                          {customerData.phone}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Logout */}
                  <div style={{ padding: '0.5rem 0.75rem 0.75rem' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1px solid #FEE2E2',
                        background: '#FEF2F2',
                        color: '#DC2626',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#FEE2E2';
                        e.currentTarget.style.borderColor = '#FECACA';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = '#FEF2F2';
                        e.currentTarget.style.borderColor = '#FEE2E2';
                      }}
                    >
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Not logged in — show Login & Admin */
            <>
              <button className="nav-button" onClick={() => onNavigate('login')}>
                Login
              </button>
              <button
                className="nav-button admin-nav-button"
                onClick={() => onNavigate('admin-login')}
              >
                Admin
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
