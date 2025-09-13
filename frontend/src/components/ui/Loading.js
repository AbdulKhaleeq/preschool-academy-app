import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} ${className}`}
    >
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          className="opacity-25"
        />
        <path
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          className="opacity-75"
        />
      </svg>
    </motion.div>
  );
};

const LoadingSkeleton = ({ 
  width = '100%', 
  height = '20px', 
  className = '',
  lines = 1,
  ...props 
}) => {
  const skeletons = Array.from({ length: lines }, (_, index) => (
    <motion.div
      key={index}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: index * 0.1
      }}
      className={`loading-skeleton ${className}`}
      style={{
        width: typeof width === 'string' ? width : `${width}px`,
        height: typeof height === 'string' ? height : `${height}px`,
        marginBottom: lines > 1 ? '8px' : '0'
      }}
      {...props}
    />
  ));

  return lines > 1 ? <div>{skeletons}</div> : skeletons[0];
};

const LoadingCard = ({ className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 ${className}`}>
      <LoadingSkeleton height="24px" width="60%" className="mb-4" />
      <LoadingSkeleton height="16px" lines={3} className="mb-3" />
      <LoadingSkeleton height="40px" width="120px" />
    </div>
  );
};

const LoadingTable = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex space-x-4">
        {Array.from({ length: columns }, (_, index) => (
          <LoadingSkeleton key={index} height="20px" width="100px" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="p-4 border-b border-gray-200 dark:border-gray-700 flex space-x-4">
          {Array.from({ length: columns }, (_, colIndex) => (
            <LoadingSkeleton key={colIndex} height="16px" width="80px" />
          ))}
        </div>
      ))}
    </div>
  );
};

export { LoadingSpinner, LoadingSkeleton, LoadingCard, LoadingTable };
