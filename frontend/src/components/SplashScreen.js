import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import wellingtonTheme from '../theme/wellingtonTheme';

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-advance to next screen after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 500); // Wait for exit animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 rounded-full border-2 border-blue-300 animate-pulse"></div>
            <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full border border-purple-300 animate-pulse"></div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col items-center justify-center space-y-6 px-8">
            {/* Logo Container */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.2,
                type: "spring",
                stiffness: 100 
              }}
              className="relative"
            >
              {/* Logo Background Glow */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full blur-xl"
                style={{ backgroundColor: '#3b82f6' }}
              />
              
              {/* Your Custom Logo */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
                <img 
                  src="/MyLogo.png" 
                  alt="Your App Logo"
                  className="w-full h-full object-contain rounded-full shadow-2xl bg-white"
                />
              </div>
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center"
            >
              <h2 
                className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
                style={{ color: '#1e293b' }}
              >
                LEARN, PLAY, GROW
              </h2>
              <p 
                className="text-sm sm:text-base opacity-90"
                style={{ color: '#64748b' }}
              >
                Welcome to Your Preschool Academy
              </p>
            </motion.div>

            {/* Loading Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="mt-8"
            >
              <div className="flex space-x-2">
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
                    style={{ backgroundColor: '#3b82f6' }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
