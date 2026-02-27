import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from '../shared/Header';
import '../../styles/customer.css';
import {
  loginCustomer,
  registerCustomer,
  sendCustomerLoginOtp,
  setAuthToken,
  verifyCustomerLoginOtp
} from '../../services/api';

const CustomerLogin = ({ onNavigate, goBack, currentPage }) => {
  const [loginType, setLoginType] = useState('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMode, setAuthMode] = useState('password'); // password or otp
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      setLoading(true);

      if (isSignUp) {
        const nameToSave = formData.name?.trim() || (formData.email ? formData.email.split('@')[0] : formData.mobile);
        await registerCustomer({
          name: nameToSave,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password
        });

        setSuccessMessage('Account created successfully. Please sign in.');
        setIsSignUp(false);
        setAuthMode('password');
        setFormData((prev) => ({
          ...prev,
          name: '',
          password: '',
          otp: ''
        }));
        return;
      }

      let data;
      if (authMode === 'otp') {
        if (loginType !== 'email') {
          setErrorMessage('OTP sign in is available only for email login.');
          return;
        }
        data = await verifyCustomerLoginOtp({
          email: formData.email,
          otp: formData.otp
        });
      } else {
        const identifier = loginType === 'email' ? formData.email : formData.mobile;
        data = await loginCustomer({
          emailOrPhone: identifier,
          password: formData.password
        });
      }

      if (data?.user?.role !== 'customer') {
        setErrorMessage('This account is not authorized for customer sign in.');
        return;
      }

      if (data?.accessToken) {
        localStorage.setItem('token', data.accessToken);
        setAuthToken(data.accessToken);
      }

      onNavigate('customer-dashboard', {
        name: data.user?.name || (data.user?.email ? data.user.email.split('@')[0] : ''),
        email: data.user?.email || '',
        phone: data.user?.phone || ''
      });
    } catch (error) {
      const msg = error?.response?.data?.message || 'Authentication failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (loginType !== 'email') {
      setErrorMessage('OTP can be sent only to email.');
      return;
    }
    if (!formData.email) {
      setErrorMessage('Enter email to receive OTP.');
      return;
    }

    try {
      setOtpSending(true);
      const res = await sendCustomerLoginOtp(formData.email);
      setSuccessMessage(res?.message || 'OTP sent successfully');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpSending(false);
    }
  };

  const toggleLoginType = (type) => {
    setLoginType(type);
    setAuthMode('password'); // Reset to password when switching identifiers
    setErrorMessage('');
    setSuccessMessage('');
    setFormData((prev) => ({
      ...prev,
      password: '',
      otp: ''
    }));
  };

  const switchAuthTab = (nextIsSignUp) => {
    setIsSignUp(nextIsSignUp);
    setAuthMode('password');
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(false);
    setFormData((prev) => ({
      ...prev,
      password: '',
      otp: '',
      // Keep email/mobile so register can suggest what was entered in sign in.
      name: nextIsSignUp ? prev.name : ''
    }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header onNavigate={onNavigate} goBack={goBack} currentPage={currentPage} />

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--color-gray-50) 0%, var(--color-primary-bg) 100%)',
        padding: '2rem'
      }}>
        <div className="card" style={{
          maxWidth: '450px',
          width: '100%',
          padding: '2.5rem',
          border: '1px solid var(--color-gray-200)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.875rem',
              color: 'var(--color-gray-900)',
              marginBottom: '0.5rem',
              fontWeight: 700
            }}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p style={{ color: 'var(--color-gray-500)' }}>
              {isSignUp ? 'Enter your details to register' : 'Please enter your details to sign in'}
            </p>
          </div>

          {/* Sign In / Register Switch */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid var(--color-gray-200)',
            marginBottom: '2rem'
          }}>
            <button
              onClick={() => switchAuthTab(false)}
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
              onClick={() => switchAuthTab(true)}
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

          {/* Login Field Type Toggle (Only for Sign In) */}
          {!isSignUp && (
            <div style={{
              display: 'flex',
              padding: '0.25rem',
              backgroundColor: 'var(--color-gray-100)',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <button
                onClick={() => toggleLoginType('email')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: loginType === 'email' ? 'var(--color-white)' : 'transparent',
                  color: loginType === 'email' ? 'var(--color-gray-900)' : 'var(--color-gray-500)',
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
                  backgroundColor: loginType === 'mobile' ? 'var(--color-white)' : 'transparent',
                  color: loginType === 'mobile' ? 'var(--color-gray-900)' : 'var(--color-gray-500)',
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
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>
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
                      color: 'var(--color-primary)',
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
                        onClick={handleSendOtp}
                        disabled={otpSending}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {otpSending ? 'Sending...' : 'Send OTP'}
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

            {(errorMessage || successMessage) && (
              <p
                style={{
                  color: errorMessage ? '#dc2626' : '#16a34a',
                  marginTop: '0.5rem',
                  fontWeight: 500
                }}
              >
                {errorMessage || successMessage}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
            >
              {loading ? (isSignUp ? 'Creating...' : 'Signing In...') : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-gray-200)' }}>
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: '1rem' }}>
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
            }} style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={16} /> Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;

