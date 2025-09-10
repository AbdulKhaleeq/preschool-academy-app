import React from 'react';

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full';
  
  const variants = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-800/30 dark:text-primary-200',
    secondary: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800/30 dark:text-neutral-200',
    success: 'bg-success-100 text-success-800 dark:bg-success-800/30 dark:text-success-200',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-800/30 dark:text-warning-200',
    danger: 'bg-error-100 text-error-800 dark:bg-error-800/30 dark:text-error-200',
    outline: 'border-2 border-primary-200 text-primary-700 bg-transparent dark:border-primary-700 dark:text-primary-300',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };
  
  return (
    <span
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;