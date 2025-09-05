import React, { useState } from 'react';
import api from '../api';

const AddUserModal = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState({ name: '', phone_number: '', role: 'parent', is_active: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const cleanedPhone = (formData.phone_number || '').replace(/\D/g, '');
      if (cleanedPhone.length !== 10) {
        setError('Phone number must be exactly 10 digits.');
        setLoading(false);
        return;
      }
      const payload = { ...formData, phone_number: cleanedPhone };
      const { data } = await api.post('/users', payload);
      if (data.success) {
        onCreated?.(data.user);
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add User</h3>
          <button className="close-btn" type="button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="teacher-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Optional" />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input name="phone_number" value={formData.phone_number} onChange={handleChange} required placeholder="10-digit number" type="tel" inputMode="numeric" maxLength={14} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Role *</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="parent">Parent</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status *</label>
              <select name="is_active" value={formData.is_active ? 'active' : 'blocked'} onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'active' }))}>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="submit-btn" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;


