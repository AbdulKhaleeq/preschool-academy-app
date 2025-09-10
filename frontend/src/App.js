import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { Button, Card, Input, Select } from './components/ui';
import api from './api';

// Demo mode - skip API calls for development
const DEMO_MODE = true;

// Demo user data
const DEMO_USERS = {
  parent: { id: 1, phone: '+919876543210', role: 'parent', name: 'John Doe' },
  teacher: { id: 2, phone: '+919876543210', role: 'teacher', name: 'Jane Smith' },
  admin: { id: 3, phone: '+919876543210', role: 'admin', name: 'Admin User' }
};

function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('parent');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (DEMO_MODE) {
        // Demo mode - simulate OTP request
        setTimeout(() => {
          setOtpRequested(true);
          setMessage('✅ OTP sent. Use demo OTP: 123456');
          setLoading(false);
        }, 1000);
        return;
      }

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
      if (DEMO_MODE) {
        // Demo mode - simulate OTP verification
        setTimeout(() => {
          if (otp === '123456') {
            const demoUser = DEMO_USERS[role];
            localStorage.setItem('token', 'demo-token');
            setUser(demoUser);
            setIsLoggedIn(true);
            setMessage('✅ Logged in');
          } else {
            setMessage('❌ Invalid OTP. Use: 123456');
          }
          setLoading(false);
        }, 1000);
        return;
      }

      const { data } = await api.post('/auth/verify-otp', { phone: phoneNumber, otp });
      if (data.success) {
        localStorage.setItem('token', data.token);
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
    return <Dashboard user={user} onLogout={handleLogout} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
  }

  const roleOptions = [
    { value: 'parent', label: '👨‍👩‍👧‍👦 Parent' },
    { value: 'teacher', label: '👩‍🏫 Teacher' },
    { value: 'admin', label: '👤 Admin' }
  ];

  // Otherwise show login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-24 h-24 bg-primary-200 rounded-full blur-xl opacity-60 dark:bg-primary-800"></div>
        <div className="absolute bottom-1/4 -right-4 w-32 h-32 bg-secondary-200 rounded-full blur-xl opacity-60 dark:bg-secondary-800"></div>
        <div className="absolute top-3/4 left-1/4 w-16 h-16 bg-accent-200 rounded-full blur-lg opacity-40 dark:bg-accent-800"></div>
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 p-3 rounded-xl bg-white dark:bg-neutral-800 shadow-soft hover:shadow-medium transition-all duration-200 z-10"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      <Card className="w-full max-w-md animate-slide-in relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-soft">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Preschool Academy
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Welcome to your learning portal
          </p>
        </div>

        {!otpRequested ? (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <Input
              label="Phone Number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+919876543210"
              required
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              }
            />

            <Select
              label="I am a"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={roleOptions}
            />

            <Button 
              type="submit" 
              loading={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <Input
              label="Enter OTP"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              required
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="ghost"
                onClick={() => setOtpRequested(false)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                loading={loading}
                className="flex-1"
                size="lg"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </div>
          </form>
        )}

        {message && (
          <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${
            message.includes('✅') 
              ? 'bg-success-50 text-success-800 border border-success-200 dark:bg-success-900/20 dark:text-success-200 dark:border-success-800' 
              : 'bg-error-50 text-error-800 border border-error-200 dark:bg-error-900/20 dark:text-error-200 dark:border-error-800'
          }`}>
            {message}
          </div>
        )}
        
        <Card className="mt-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-0" padding="sm">
          <h4 className="font-semibold text-primary-700 dark:text-primary-300 mb-2">Demo Login:</h4>
          <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">Phone: +919876543210</p>
          <p className="text-sm text-primary-600 dark:text-primary-400">OTP: 123456 (for demo)</p>
          <p className="text-xs text-primary-500 dark:text-primary-500 mt-2">
            Try different roles to see various dashboards
          </p>
        </Card>
      </Card>
    </div>
  );
}

export default App;


