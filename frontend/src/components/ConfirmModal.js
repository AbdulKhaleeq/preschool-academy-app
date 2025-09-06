import React from 'react';

const ConfirmModal = ({ isOpen, title = 'Confirm', message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onCancel} type="button">×</button>
        </div>
        <div style={{ padding: 20 }}>
          <p>{message}</p>
          <div className="modal-actions">
            <button className="cancel-btn" type="button" onClick={onCancel}>{cancelText}</button>
            <button className="submit-btn" type="button" onClick={onConfirm}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;



