import React from 'react';
import { motion } from 'framer-motion';

const FloatingActionButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  position = 'bottom-right',
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-glow',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const sizes = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16'
  };

  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        fixed ${positions[position]} z-50 
        ${sizes[size]} ${variants[variant]}
        rounded-full shadow-lg hover:shadow-xl
        flex items-center justify-center
        transition-all duration-200
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default FloatingActionButton;
