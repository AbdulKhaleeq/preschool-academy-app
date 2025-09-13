import React from 'react';
import { ConfirmModal as ModernConfirmModal } from './ui';

const ConfirmModal = ({ 
  isOpen, 
  title = 'Confirm', 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  onConfirm, 
  onCancel,
  loading = false
}) => {
  return (
    <ModernConfirmModal
      isOpen={isOpen}
      onClose={onCancel}
      onConfirm={onConfirm}
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText={cancelText}
      loading={loading}
    />
  );
};

export default ConfirmModal;



