import React from 'react';

const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-neutral-400 w-5 h-5">
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full px-4 py-3 bg-white border rounded-xl text-neutral-900 placeholder-neutral-500
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
            transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error 
              ? 'border-error-300 focus:ring-error-500 focus:border-error-500 dark:border-error-600' 
              : 'border-neutral-300 dark:border-neutral-600'
            }
          `}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-neutral-400 w-5 h-5">
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-error-600 dark:text-error-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;