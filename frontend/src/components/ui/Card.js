import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'normal',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-2xl shadow-soft border border-neutral-200/60 dark:bg-neutral-800 dark:border-neutral-700/60';
  
  const hoverClasses = hover ? 'transition-all duration-200 hover:shadow-medium hover:-translate-y-1 cursor-pointer' : '';
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    normal: 'p-6',
    lg: 'p-8',
  };
  
  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-neutral-900 dark:text-neutral-100 ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-neutral-600 dark:text-neutral-400 ${className}`}>
    {children}
  </p>
);

const CardBody = ({ children, className = '' }) => (
  <div className={`${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;