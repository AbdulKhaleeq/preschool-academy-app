import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  hideCloseButton = false,
  className = '',
  overlayClassName = ''
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${overlayClassName}`}
          onClick={handleOverlayClick}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`
              relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl 
              w-full ${sizes[size]} max-h-[90vh] overflow-hidden
              ${className}
            `}
          >
            {/* Header */}
            {(title || !hideCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                {title && (
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {title}
                  </h2>
                )}
                {!hideCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ModalHeader = ({ children, className = '' }) => (
  <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

const ModalBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const ModalFooter = ({ children, className = '' }) => (
  <div className={`p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 ${className}`}>
    {children}
  </div>
);

// Confirmation Modal
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" hideCloseButton>
      <ModalBody>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {message}
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export { Modal, ConfirmModal };
