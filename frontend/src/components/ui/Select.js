import React from 'react';

const Select = ({
  label,
  id,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label 
          htmlFor={selectId} 
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full px-4 py-3 bg-white border rounded-xl text-neutral-900
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
            transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            dark:bg-neutral-800 dark:text-neutral-100
            appearance-none cursor-pointer
            ${error 
              ? 'border-error-300 focus:ring-error-500 focus:border-error-500 dark:border-error-600' 
              : 'border-neutral-300 dark:border-neutral-600'
            }
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option, index) => (
            <option key={index} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-error-600 dark:text-error-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;