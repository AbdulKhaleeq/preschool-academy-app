import React, { useEffect, useState } from 'react';
import api from '../api';

const EditUserModal = ({ isOpen, onClose, user, onUpdated }) => {
  const [form, setForm] = useState({ name: '', phone_number: '', role: 'parent', is_active: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setForm({ name: user.name || '', phone_number: user.phone_number || '', role: user.role || 'parent', is_active: !!user.is_active });
      setError('');
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const cleanedPhone = (form.phone_number || '').replace(/\D/g, '');
      if (cleanedPhone.length !== 10) {
        setError('Phone number must be exactly 10 digits.');
        setLoading(false);
        return;
      }
      const payload = { ...form, phone_number: cleanedPhone };
      const { data } = await api.put(`/users/${user.id}`, payload);
      if (data.success) {
        onUpdated?.(data.user);
        onClose();
      } else {
        setError(data.message || 'Failed to update user');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Server error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Edit User</h3>
          <button className="close-btn" type="button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="teacher-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input name="phone_number" value={form.phone_number} onChange={handleChange} required placeholder="10-digit number" type="tel" inputMode="numeric" maxLength={14} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Role *</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="parent">Parent</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status *</label>
              <select name="is_active" value={form.is_active ? 'active' : 'blocked'} onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.value === 'active' }))}>
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

export default EditUserModal;


