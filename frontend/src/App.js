import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import './App.css';
import api from './api';

function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('parent');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null); // This will hold logged-in user data
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data } = await api.post('/auth/request-otp', { phone: phoneNumber, role });
      if (data.success) {
        setOtpRequested(true);
        setMessage('✅ OTP sent. Use demo OTP shown here: ' + (data.otp || '******'));
      } else {
        setMessage(data.message || '❌ Failed to request OTP');
      }
    } catch (error) {
      setMessage(error?.response?.data?.message || '❌ Connection error');
      console.error('OTP request error:', error);
    }
    
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data } = await api.post('/auth/verify-otp', { phone: phoneNumber, otp });
      if (data.success) {
        localStorage.setItem('token', data.token);
        // Validate role match if user selected a role
        if (role && data.user?.role && role !== data.user.role) {
          setMessage('Role does not match account');
          localStorage.removeItem('token');
        } else {
          const loggedInUser = { ...data.user };
          setUser(loggedInUser);
          setIsLoggedIn(true);
          setMessage('✅ Logged in');
        }
      } else if (data.blocked) {
        setMessage('You are Blocked.');
      } else {
        setMessage('❌ Invalid OTP');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || '❌ Verification failed';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    setPhoneNumber('');
    setMessage('');
    setRole('parent');
    setOtp('');
    setOtpRequested(false);
  };

  // If user is logged in, show dashboard
  if (isLoggedIn && user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // Otherwise show login form
  return (
    <div className="App">
      <div className="login-container">
        <h1>🎓 Preschool Academy</h1>
        <h2>Login</h2>
        
        {!otpRequested && (
        <form onSubmit={handleRequestOtp}>
          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+919876543210"
              required
            />
          </div>

          <div className="form-group">
            <label>I am a:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
        )}

        {otpRequested && (
        <form onSubmit={handleVerifyOtp}>
          <div className="form-group">
            <label>Enter OTP:</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        )}

        {message && <div className="message">{message}</div>}
        
        <div className="demo-credentials">
          <h4>Demo Login:</h4>
          <p>Phone: +919876543210</p>
          <p>OTP will be shown after requesting (dev only)</p>
        </div>
      </div>
    </div>
  );
}

export default App;


