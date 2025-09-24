import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AppFlowController from './components/AppFlowController';
import './styles/globals.css';
import api from './api';
import { auth, initOrResetRecaptcha } from './firebase';
import { signInWithPhoneNumber, signOut } from 'firebase/auth';
import { ThemeProvider } from './contexts/ThemeContext';
import { Card, Button, Input } from './components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneIcon, KeyIcon } from '@heroicons/react/24/outline';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

// Preschool Academy Management System - Main App Component

function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Rate limiting states
  const [canRequestOtp, setCanRequestOtp] = useState(true);
  const [countdown, setCountdown] = useState(0);

    // 🔑 Restore user session on startup
  useEffect(() => {
    const token = localStorage.getItem('token');
    const lastLoginTime = localStorage.getItem('wellington_last_login');
    if (token && lastLoginTime) {
      const daysSinceLogin = (Date.now() - parseInt(lastLoginTime)) / (24 * 60 * 60 * 1000);
      if (daysSinceLogin < 30) {
        // ✅ Restore logged-in state
        setIsLoggedIn(true);
        // Optionally, fetch user details from backend using token
        setUser({ role: 'user' }); // Placeholder; adjust as needed
      } else {
        // Session expired
        localStorage.removeItem('token');
        localStorage.removeItem('wellington_last_login');
      }
    }
  }, []);

  // Rate limiting countdown effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && !canRequestOtp) {
      setCanRequestOtp(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, canRequestOtp]);

  // 30-day auto logout check
  useEffect(() => {
    if (user) {
      const lastLoginTime = localStorage.getItem('wellington_last_login');
      if (lastLoginTime) {
        const daysSinceLogin = (Date.now() - parseInt(lastLoginTime)) / (24 * 60 * 60 * 1000);
        if (daysSinceLogin >= 30) {
          handleLogout();
          toast.error('Session expired after 30 days. Please login again.');
        }
      }
    }
  }, [user]);

  // Mobile number validation
  const isMobileValid = phoneNumber.trim().length === 10 && /^\d{10}$/.test(phoneNumber.trim());

  // OTP validation
  const isOtpValid = otp.trim().length === 6 && /^\d{6}$/.test(otp.trim());

  // Handle mobile number input with validation
  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // Only allow digits
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  // Handle OTP input with validation
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    
    if (!canRequestOtp) {
      toast.error(`Please wait ${countdown} seconds before requesting another OTP`);
      return;
    }
    
    setLoading(true);

    try {
      // Clean phone number and prefix country code +91
      const local = phoneNumber.trim();
      const e164 = `+91${local}`;
      
      // Pre-check with backend if this mobile is registered/allowed before sending SMS
      try {
        await api.post('/auth/precheck-phone', { phone: local });
      } catch (preErr) {
        const msg = preErr?.response?.data?.message || 'Mobile number not registered. Please contact admin.';
        throw new Error(msg);
      }

      // Initialize a fresh invisible reCAPTCHA each request to avoid removed element errors
      const verifier = initOrResetRecaptcha();
      
      // Render the reCAPTCHA verifier before using it
      await verifier.render();
      
      const result = await signInWithPhoneNumber(auth, e164, verifier);
      setConfirmationResult(result);
      setOtpRequested(true);
      
      // Start rate limiting countdown (60 seconds)
      setCanRequestOtp(false);
      setCountdown(60);
      
      toast.success('OTP sent successfully');
    } catch (error) {
      // Enhanced error handling for Firebase auth errors
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.code === 'auth/invalid-app-credential') {
        errorMessage = 'App credentials invalid';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait before trying again.';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'reCAPTCHA verification failed. Please try again.';
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Reset state on error
      setOtpRequested(false);
      setConfirmationResult(null);
    }
    
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!confirmationResult) {
        toast.error('Please request OTP again.');
        return;
      }
      // Confirm OTP with Firebase
      const credential = await confirmationResult.confirm(otp);
      // Get Firebase ID token
      const idToken = await credential.user.getIdToken();
      // Exchange with backend for app JWT and role
      const { data } = await api.post('/auth/firebase-login', {
        idToken,
        phone: phoneNumber.trim(),
      });
      if (data.success) {
        setOtpRequested(false);
        setOtp('');
        setConfirmationResult(null);
        localStorage.setItem('token', data.token);
        localStorage.setItem('wellington_last_login', Date.now().toString());
        const loggedInUser = { ...data.user };
        setUser(loggedInUser);
        setIsLoggedIn(true);
        toast.success(`Welcome ${data.user.role}! Successfully logged in!`);
      } else if (data.blocked) {
        toast.error('Your account has been blocked. Please contact admin.');
      } else {
        toast.error(data.message || 'Login failed.');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message;
      toast.error(errorMessage || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    try { signOut(auth); } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('wellington_last_login'); // Clear login timestamp
    localStorage.removeItem('wellington_onboarding_completed'); // Reset onboarding on logout
    setUser(null);
    setIsLoggedIn(false);
    setPhoneNumber('');
    setOtp('');
    setOtpRequested(false);
    toast.success('Successfully logged out');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
          }}
        />
        
        <AppFlowController user={user}>
          {isLoggedIn && user ? (
            <Dashboard user={user} onLogout={handleLogout} />
          ) : (
            <div className="min-h-screen flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
              >
                <Card className="p-8">
                  <div className="text-center mb-8">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center justify-center space-x-3 mb-2"
                    >
                      <img 
                        src="/MyLogo.png" 
                        alt="Wellington Kids Logo"
                        className="w-10 h-10 object-contain"
                      />
                      <h1 className="text-3xl font-bold text-gradient">
                        Wellington Kids
                      </h1>
                    </motion.div>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-gray-600 dark:text-gray-400"
                    >
                      Welcome back! Please sign in to continue.
                    </motion.p>
                  </div>

                  <AnimatePresence mode="wait">
                    {!otpRequested ? (
                      <motion.form
                        key="phone-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleRequestOtp}
                        className="space-y-6"
                      >
                        <Input
                          label="Mobile"
                          type="tel"
                          value={phoneNumber}
                          onChange={handleMobileChange}
                          placeholder="Enter here"
                          icon={PhoneIcon}
                          required
                          maxLength={10}
                        />

                        {phoneNumber && !isMobileValid && (
                          <p className="text-sm text-red-500 mt-1">
                            Please enter a valid 10-digit mobile number
                          </p>
                        )}

                        <Button
                          type="submit"
                          loading={loading}
                          disabled={!isMobileValid || loading || !canRequestOtp}
                          className="w-full"
                          variant="gradient"
                        >
                          {!canRequestOtp ? `Resend OTP in ${countdown}s` : 'Send OTP'}
                        </Button>
                        
                        {!canRequestOtp && (
                          <p className="text-sm text-gray-500 mt-2 text-center">
                            Please wait {countdown} seconds before requesting another OTP
                          </p>
                        )}
                      </motion.form>
                    ) : (
                      <motion.form
                        key="otp-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleVerifyOtp}
                        className="space-y-6"
                      >
                        <Input
                          label="Enter OTP"
                          type="text"
                          value={otp}
                          onChange={handleOtpChange}
                          placeholder="6-digit OTP"
                          icon={KeyIcon}
                          required
                          maxLength={6}
                        />

                        {otp && !isOtpValid && (
                          <p className="text-sm text-red-500 mt-1">
                            Please enter a valid 6-digit OTP
                          </p>
                        )}

                        <div className="flex space-x-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setOtpRequested(false);
                              setOtp('');
                            }}
                            className="flex-1"
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            loading={loading}
                            disabled={!isOtpValid || loading}
                            className="flex-1"
                            variant="gradient"
                          >
                            Verify OTP
                          </Button>
                        </div>
                        
                        {/* Resend OTP Button with Rate Limiting */}
                        <div className="text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={handleRequestOtp}
                            disabled={!canRequestOtp || loading}
                            className="text-sm"
                          >
                            {!canRequestOtp ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                          </Button>
                          
                          {!canRequestOtp && (
                            <p className="text-xs text-gray-500 mt-1">
                              Please wait {countdown} seconds before requesting another OTP
                            </p>
                          )}
                        </div>
                        </motion.form>
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                  >
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Demo Login:
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Phone: 9876543210
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      OTP will arrive by SMS
                    </p>
                  </motion.div>
                </Card>
              </motion.div>
            </div>
          )}
        </AppFlowController>
      </div>
    </ThemeProvider>
  );
}

export default App;


