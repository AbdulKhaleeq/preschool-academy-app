import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-soft hover:shadow-medium',
    secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 focus:ring-neutral-500 shadow-soft hover:shadow-medium dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700',
    ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500 dark:text-neutral-200 dark:hover:bg-neutral-800',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-soft hover:shadow-medium',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 shadow-soft hover:shadow-medium',
    danger: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 shadow-soft hover:shadow-medium',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-primary-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg className={`animate-spin -ml-1 mr-3 ${iconSizes[size]}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        <>
          {leftIcon && (
            <span className={`mr-2 ${iconSizes[size]}`}>
              {leftIcon}
            </span>
          )}
          {children}
          {rightIcon && (
            <span className={`ml-2 ${iconSizes[size]}`}>
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;