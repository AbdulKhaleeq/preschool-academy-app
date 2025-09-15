import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhoneIcon, 
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import wellingtonTheme from '../theme/wellingtonTheme';

const ModernAuth = ({ onLogin }) => {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'success'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call for OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('otp');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter the complete OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call for OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (otpValue === '123456') { // Demo OTP
        setStep('success');
        setTimeout(() => {
          onLogin({ phone: phoneNumber, verified: true });
        }, 2000);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPhoneStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: wellingtonTheme.colors.gold }}
        >
          <PhoneIcon className="w-8 h-8" style={{ color: wellingtonTheme.colors.navy }} />
        </motion.div>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: wellingtonTheme.colors.navy }}>
          Enter Mobile Number
        </h1>
        <p className="text-gray-600">
          You will receive an OTP for verification
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handlePhoneSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: wellingtonTheme.colors.navy }}>
            Mobile Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            className="w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-0 transition-colors"
            style={{ 
              borderColor: error ? wellingtonTheme.colors.error : wellingtonTheme.colors.gray,
              focusBorderColor: wellingtonTheme.colors.navy
            }}
            maxLength={15}
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-3 rounded-lg"
            style={{ backgroundColor: '#fef2f2', color: wellingtonTheme.colors.error }}
          >
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2"
          style={{ 
            backgroundColor: wellingtonTheme.colors.navy,
            color: 'white',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Send OTP</span>
          )}
        </motion.button>
      </form>
    </motion.div>
  );

  const renderOtpStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Back Button */}
      <button
        onClick={() => setStep('phone')}
        className="flex items-center space-x-2 mb-6 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <ArrowLeftIcon className="w-5 h-5" style={{ color: wellingtonTheme.colors.navy }} />
        <span style={{ color: wellingtonTheme.colors.navy }}>Back</span>
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: wellingtonTheme.colors.gold }}
        >
          <div className="text-2xl font-bold" style={{ color: wellingtonTheme.colors.navy }}>
            #
          </div>
        </motion.div>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: wellingtonTheme.colors.navy }}>
          Enter OTP
        </h1>
        <p className="text-gray-600">
          Code sent to {phoneNumber}
        </p>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleOtpSubmit} className="space-y-6">
        <div className="flex justify-center space-x-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              className="w-12 h-12 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:ring-0 transition-colors"
              style={{ 
                borderColor: error ? wellingtonTheme.colors.error : wellingtonTheme.colors.gray,
                focusBorderColor: wellingtonTheme.colors.navy
              }}
              maxLength={1}
            />
          ))}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-3 rounded-lg"
            style={{ backgroundColor: '#fef2f2', color: wellingtonTheme.colors.error }}
          >
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2"
          style={{ 
            backgroundColor: wellingtonTheme.colors.navy,
            color: 'white',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Verify OTP</span>
          )}
        </motion.button>

        <button
          type="button"
          className="w-full py-2 text-center font-medium"
          style={{ color: wellingtonTheme.colors.gold }}
        >
          Resend OTP
        </button>
      </form>
    </motion.div>
  );

  const renderSuccessStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
        style={{ backgroundColor: wellingtonTheme.colors.green }}
      >
        <CheckIcon className="w-10 h-10 text-white" />
      </motion.div>
      
      <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: wellingtonTheme.colors.navy }}>
        Welcome to Wellington Kids!
      </h1>
      <p className="text-gray-600 mb-8">
        Your account has been verified successfully
      </p>

      <div className="flex space-x-2 justify-center">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              y: [0, -8, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: wellingtonTheme.colors.gold }}
          />
        ))}
      </div>
    </motion.div>
  );

  return (
    <div 
      className="fixed inset-0 z-30 flex items-center justify-center p-6"
      style={{ background: `linear-gradient(135deg, ${wellingtonTheme.colors.cream} 0%, #ffffff 100%)` }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full" style={{ backgroundColor: wellingtonTheme.colors.navy }}></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full" style={{ backgroundColor: wellingtonTheme.colors.gold }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full" style={{ backgroundColor: wellingtonTheme.colors.green }}></div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'phone' && renderPhoneStep()}
        {step === 'otp' && renderOtpStep()}
        {step === 'success' && renderSuccessStep()}
      </AnimatePresence>
    </div>
  );
};

export default ModernAuth;