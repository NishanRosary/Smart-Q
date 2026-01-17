import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from '../shared/Header';
import '../../styles/customer.css';

const CustomerLogin = ({ onNavigate, goBack, currentPage }) => {
  const [loginType, setLoginType] = useState('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMode, setAuthMode] = useState('password'); // password or otp
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
    onNavigate('customer-dashboard');
  };

  const toggleLoginType = (type) => {
    setLoginType(type);
    setAuthMode('password'); // Reset to password when switching identifiers
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onNavigate={onNavigate} goBack={goBack} currentPage={currentPage} />

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
        padding: '2rem'
      }}>
        <div className="card" style={{
          maxWidth: '450px',
          width: '100%',
          padding: '2.5rem',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.875rem',
              color: '#0F172A',
              marginBottom: '0.5rem',
              fontWeight: 700
            }}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p style={{ color: '#64748B' }}>
              {isSignUp ? 'Enter your details to register' : 'Please enter your details to sign in'}
            </p>
          </div>

          {/* Sign In / Register Switch */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #E2E8F0',
            marginBottom: '2rem'
          }}>
            <button
              onClick={() => setIsSignUp(false)}
              style={{
                flex: 1,
                padding: '1rem',
                background: 'none',
                border: 'none',
                borderBottom: !isSignUp ? '2px solid #3B82F6' : 'none',
                marginBottom: '-2px',
                color: !isSignUp ? '#3B82F6' : '#64748B',
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
                borderBottom: isSignUp ? '2px solid #3B82F6' : 'none',
                marginBottom: '-2px',
                color: isSignUp ? '#3B82F6' : '#64748B',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Register
            </button>
          </div>

          {/* Login Field Type Toggle (Only for Sign In) */}
          {!isSignUp && (
            <div style={{
              display: 'flex',
              padding: '0.25rem',
              backgroundColor: '#F1F5F9',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <button
                onClick={() => toggleLoginType('email')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: loginType === 'email' ? '#FFFFFF' : 'transparent',
                  color: loginType === 'email' ? '#0F172A' : '#64748B',
                  boxShadow: loginType === 'email' ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease'
                }}
              >
                Email
              </button>
              <button
                onClick={() => toggleLoginType('mobile')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: loginType === 'mobile' ? '#FFFFFF' : 'transparent',
                  color: loginType === 'mobile' ? '#0F172A' : '#64748B',
                  boxShadow: loginType === 'mobile' ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease'
                }}
              >
                Mobile
              </button>
            </div>
          )}

          <form onSubmit={handleLogin}>
            {isSignUp ? (
              // Register Form (All fields)
              <>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@gmail.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mobile">Mobile Number</label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="Enter Number"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter Password"
                    required
                  />
                </div>
              </>
            ) : (
              // Sign In Form (Existing logic)
              <>
                {loginType === 'email' ? (
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@gmail.com"
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
                      placeholder="Enter Number"
                      required
                    />
                  </div>
                )}

                {/* Auth Mode Toggle (Password/OTP) - Only for Login */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'password' ? 'otp' : 'password')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3B82F6',
                      fontSize: '0.875rem',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    {authMode === 'password' ? 'Login via OTP' : 'Login via Password'}
                  </button>
                </div>

                {authMode === 'otp' ? (
                  <div className="form-group">
                    <label htmlFor="otp">One Time Password</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        id="otp"
                        name="otp"
                        value={formData.otp}
                        onChange={handleInputChange}
                        placeholder="Enter 6-digit OTP"
                        maxLength="6"
                        style={{ letterSpacing: '0.25em', textAlign: 'center' }}
                        required
                      />
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        Send OTP
                      </button>
                    </div>
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
                      placeholder="Enter Password"
                      required
                    />
                  </div>
                )}
              </>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #E2E8F0' }}>
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748B', marginBottom: '1rem' }}>
              Don't have an account?
            </p>
            <button
              className="btn-secondary"
              onClick={() => onNavigate('join-queue')}
              style={{ width: '100%' }}
            >
              Join Queue as Guest
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              onNavigate('landing');
            }} style={{ fontSize: '0.875rem', color: '#64748B', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={16} /> Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;

