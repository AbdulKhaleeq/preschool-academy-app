import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import './styles/globals.css';
import api from './api';
import { ThemeProvider } from './contexts/ThemeContext';
import { Card, Button, Input, Select } from './components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneIcon, KeyIcon } from '@heroicons/react/24/outline';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('parent');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/request-otp', { phone: phoneNumber, role });
      if (data.success) {
        setOtpRequested(true);
        toast.success(`OTP sent successfully! Demo OTP: ${data.otp || '******'}`);
      } else {
        toast.error(data.message || 'Failed to request OTP');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Connection error');
      console.error('OTP request error:', error);
    }
    
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/verify-otp', { phone: phoneNumber, otp });
      if (data.success) {
        localStorage.setItem('token', data.token);
        if (role && data.user?.role && role !== data.user.role) {
          toast.error('Role does not match account');
          localStorage.removeItem('token');
        } else {
          const loggedInUser = { ...data.user };
          setUser(loggedInUser);
          setIsLoggedIn(true);
          toast.success('Successfully logged in!');
        }
      } else if (data.blocked) {
        toast.error('Your account has been blocked');
      } else {
        toast.error('Invalid OTP');
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Verification failed';
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
                  <motion.h1 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-gradient mb-2"
                  >
                    🎓 Preschool Academy
                  </motion.h1>
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
                        label="Phone Number"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+919876543210"
                        icon={PhoneIcon}
                        required
                      />

                      <Select
                        label="I am a"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        options={roleOptions}
                        required
                      />

                      <Button
                        type="submit"
                        loading={loading}
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
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="6-digit OTP"
                        icon={KeyIcon}
                        required
                      />

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
                    Phone: +919876543210
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    OTP will be shown after requesting
                  </p>
                </motion.div>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;


