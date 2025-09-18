import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import AppFlowController from './components/AppFlowController';
import './styles/globals.css';
import api from './api';
import { ThemeProvider } from './contexts/ThemeContext';
import { Card, Button, Input, Select } from './components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneIcon, KeyIcon } from '@heroicons/react/24/outline';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

// Preschool Academy Management System - Main App Component

function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('parent');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    setLoading(true);

    try {
      // Clean phone number (remove spaces)
      const cleanPhone = phoneNumber.trim();
      
      const { data } = await api.post('/auth/request-otp', { phone: cleanPhone });
      if (data.success) {
        setOtpRequested(true);
        toast.success(`OTP sent successfully! Demo OTP: ${data.otp || '******'}`);
      } else {
        // Handle specific error messages
        if (data.message && data.message.toLowerCase().includes('not found')) {
          toast.error('Mobile number not registered. Please contact admin.');
        } else {
          toast.error(data.message || 'Failed to request OTP');
        }
      }
    } catch (error) {
      // Handle network/server errors
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && errorMessage.toLowerCase().includes('not found')) {
        toast.error('Mobile number not registered. Please contact admin.');
      } else if (errorMessage && errorMessage.toLowerCase().includes('not registered')) {
        toast.error('Mobile number not registered. Please contact admin.');
      } else {
        toast.error(errorMessage || 'Connection error. Please try again.');
      }
      console.error('OTP request error:', error);
    }
    
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/verify-otp', { phone: phoneNumber.trim(), otp });
      if (data.success) {
        localStorage.setItem('token', data.token);
        const loggedInUser = { ...data.user };
        setUser(loggedInUser);
        setIsLoggedIn(true);
        toast.success(`Welcome ${data.user.role}! Successfully logged in!`);
      } else if (data.blocked) {
        toast.error('Your account has been blocked. Please contact admin.');
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Verification failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    setPhoneNumber('');
    setRole('parent');
    setOtp('');
    setOtpRequested(false);
    toast.success('Successfully logged out');
  };

  const roleOptions = [
    { value: 'parent', label: '👨‍👩‍👧‍👦 Parent' },
    { value: 'teacher', label: '👩‍🏫 Teacher' },
    { value: 'admin', label: '👨‍💼 Admin' }
  ];

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
                          disabled={!isMobileValid || loading}
                          className="w-full"
                          variant="gradient"
                        >
                          Send OTP
                        </Button>
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
                            onClick={() => setOtpRequested(false)}
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
                      OTP will be shown after requesting
                    </p>
                    
                    {/* Reset Onboarding Button for Testing */}
                    <button
                      onClick={() => {
                        localStorage.removeItem('wellington_onboarding_completed');
                        toast.success('Onboarding reset! Refresh to see again.');
                      }}
                      className="mt-3 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Reset Onboarding (for testing)
                    </button>
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


