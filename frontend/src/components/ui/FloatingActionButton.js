import React from 'react';

const FloatingActionButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  position = 'bottom-right',
  className = '',
  disabled = false,
  ...props
}) => {
  const baseClasses = `
    fixed z-50 rounded-full shadow-large transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center
  `;
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 hover:shadow-xl',
    secondary: 'bg-neutral-600 text-white hover:bg-neutral-700 focus:ring-neutral-500 hover:shadow-xl',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 hover:shadow-xl',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 hover:shadow-xl',
    danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 hover:shadow-xl',
  };
  
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };
  
  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2',
    'top-center': 'top-6 left-1/2 transform -translate-x-1/2',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${positions[position]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// Extended FAB with label
const FABWithLabel = ({
  children,
  label,
  onClick,
  variant = 'primary',
  position = 'bottom-right',
  className = '',
  disabled = false,
  ...props
}) => {
  const baseClasses = `
    fixed z-50 rounded-full shadow-large transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center space-x-3 px-4 py-3
  `;
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 hover:shadow-xl',
    secondary: 'bg-neutral-600 text-white hover:bg-neutral-700 focus:ring-neutral-500 hover:shadow-xl',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 hover:shadow-xl',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 hover:shadow-xl',
    danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 hover:shadow-xl',
  };
  
  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2',
    'top-center': 'top-6 left-1/2 transform -translate-x-1/2',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${positions[position]}
        ${className}
      `}
      {...props}
    >
      <span className="w-5 h-5">
        {children}
      </span>
      <span className="text-sm font-medium">
        {label}
      </span>
    </button>
  );
};

FloatingActionButton.WithLabel = FABWithLabel;

export default FloatingActionButton;