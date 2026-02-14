import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import '../../styles/admin.css';
import '../../styles/global.css';

const AdminLogin = ({ onNavigate, goBack, currentPage }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    mobile: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Visual only - no real functionality
    onNavigate('admin-dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
      padding: '2rem'
    }}>
      <div className="card" style={{
        maxWidth: '400px',
        width: '100%',
        padding: '3rem 2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.75rem',
            color: 'var(--color-gray-900)',
            marginBottom: '0.5rem',
            fontWeight: 800
          }}>
            {isSignUp ? 'New Admin Registration' : 'Admin Portal'}
          </h2>
          <p style={{ color: 'var(--color-gray-500)', fontSize: '0.9375rem' }}>
            {isSignUp ? 'Create new administrative access' : 'Restricted access for authorized personnel'}
          </p>
        </div>

        {/* Sign In / Register Switch */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid var(--color-gray-200)',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => setIsSignUp(false)}
            style={{
              flex: 1,
              padding: '1rem',
              background: 'none',
              border: 'none',
              borderBottom: !isSignUp ? '2px solid var(--color-primary)' : 'none',
              marginBottom: '-2px',
              color: !isSignUp ? 'var(--color-primary)' : 'var(--color-gray-500)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            style={{
              flex: 1,
              padding: '1rem',
              background: 'none',
              border: 'none',
              borderBottom: isSignUp ? '2px solid var(--color-primary)' : 'none',
              marginBottom: '-2px',
              color: isSignUp ? 'var(--color-primary)' : 'var(--color-gray-500)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username" style={{ color: 'var(--color-gray-700)' }}>Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter Username"
              style={{ background: 'var(--color-gray-50)' }}
              required
            />
          </div>

          {isSignUp && (
            <>
              <div className="form-group">
                <label htmlFor="email" style={{ color: 'var(--color-gray-700)' }}>Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email || ''} // Handle undefined since we didn't init
                  onChange={handleInputChange}
                  placeholder="Enter Email"
                  style={{ background: 'var(--color-gray-50)' }}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="mobile" style={{ color: 'var(--color-gray-700)' }}>Mobile</label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile || ''}
                  onChange={handleInputChange}
                  placeholder="Enter Mobile Number"
                  style={{ background: 'var(--color-gray-50)' }}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="password" style={{ color: 'var(--color-gray-700)' }}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter Password"
              style={{ background: 'var(--color-gray-50)' }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '0.875rem',
              backgroundColor: 'var(--color-primary)',
              fontSize: '1rem'
            }}
          >
            {isSignUp ? 'Create Admin Account' : 'Authenticate'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-gray-200)' }}>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            onNavigate('landing');
          }} style={{
            fontSize: '0.875rem',
            color: 'var(--color-gray-500)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'color 0.2s'
          }}
            onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'}
            onMouseOut={(e) => /**/ e.target.style.color = 'var(--color-gray-500)'}
          >
            <ArrowLeft size={16} /> Return to Public Site
          </a>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '1rem',
        color: 'var(--color-gray-500)',
        fontSize: '0.75rem'
      }}>
        Authorized Access Only • Smart'Q System v1.0
      </div>
    </div>
  );
};

export default AdminLogin;

