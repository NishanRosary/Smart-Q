import React, { useState } from 'react';
import Header from '../shared/Header';
import '../../styles/customer.css';

const CustomerLogin = ({ onNavigate }) => {
  const [loginType, setLoginType] = useState('email');
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    password: '',
    otp: ''
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
    onNavigate('customer-dashboard');
  };

  return (
    <div>
      <Header onNavigate={onNavigate} />
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Customer Login</h2>
          
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '1.5rem',
            borderBottom: '1px solid #E5E7EB',
            paddingBottom: '1rem'
          }}>
            <button
              className={loginType === 'email' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setLoginType('email')}
              style={{ flex: 1 }}
            >
              Email
            </button>
            <button
              className={loginType === 'mobile' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setLoginType('mobile')}
              style={{ flex: 1 }}
            >
              Mobile
            </button>
          </div>

          <form onSubmit={handleLogin}>
            {loginType === 'email' ? (
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="mobile">Mobile Number</label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter your mobile number"
                  required
                />
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginBottom: '1.5rem',
              borderBottom: '1px solid #E5E7EB',
              paddingBottom: '1rem'
            }}>
              <button
                type="button"
                className={!loginType.includes('otp') ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setLoginType(loginType === 'email' ? 'email' : 'mobile')}
                style={{ flex: 1 }}
              >
                Password
              </button>
              <button
                type="button"
                className={loginType.includes('otp') ? 'btn-primary' : 'btn-secondary'}
                onClick={() => setLoginType(loginType === 'email' ? 'email-otp' : 'mobile-otp')}
                style={{ flex: 1 }}
              >
                OTP
              </button>
            </div>

            {loginType.includes('otp') ? (
              <div className="form-group">
                <label htmlFor="otp">OTP</label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  placeholder="Enter OTP"
                  maxLength="6"
                  required
                />
                <button 
                  type="button" 
                  className="btn-secondary"
                  style={{ marginTop: '0.5rem', width: '100%' }}
                >
                  Send OTP
                </button>
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
              Login
            </button>
          </form>

          <div className="qr-link">
            <a href="#" onClick={(e) => {
              e.preventDefault();
              onNavigate('join-queue');
            }}>
              Join via QR Code →
            </a>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              onNavigate('landing');
            }} style={{ fontSize: '0.875rem', color: '#6B7280' }}>
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;

