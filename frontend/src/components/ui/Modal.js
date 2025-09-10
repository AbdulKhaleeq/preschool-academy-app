import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = ''
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };
  
  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`
            relative bg-white rounded-2xl shadow-large w-full ${sizes[size]}
            dark:bg-neutral-800 animate-slide-in ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
              {title && (
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 text-neutral-400 hover:text-neutral-600 rounded-xl hover:bg-neutral-100 
                           transition-colors dark:hover:text-neutral-200 dark:hover:bg-neutral-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
  
  return createPortal(modalContent, document.body);
};

const ModalBody = ({ children, className = '' }) => (
  <div className={`${className}`}>
    {children}
  </div>
);

const ModalFooter = ({ children, className = '' }) => (
  <div className={`flex justify-end space-x-3 pt-4 mt-6 border-t border-neutral-200 dark:border-neutral-700 ${className}`}>
    {children}
  </div>
);

Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;