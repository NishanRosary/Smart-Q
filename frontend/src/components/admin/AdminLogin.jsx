import React, { useState } from 'react';
import '../../styles/admin.css';
import '../../styles/global.css';

const AdminLogin = ({ onNavigate, goBack, currentPage }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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
      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      padding: '2rem'
    }}>
      <div className="login-card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="login-title" style={{ color: '#1F2937' }}>Admin Login</h2>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
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
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Login
          </button>
        </form>

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
  );
};

export default AdminLogin;

