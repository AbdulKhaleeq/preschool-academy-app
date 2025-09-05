import React, { useState } from 'react';
import api from '../api';

const AddTeacherModal = ({ isOpen, onClose, onTeacherAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    class_name: '',
    experience_years: '',
    qualification: '',
    subject: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/teachers', formData);

      if (data.success) {
        // Reset form
        setFormData({
          name: '',
          phone_number: '',
          email: '',
          class_name: '',
          experience_years: '',
          qualification: '',
          subject: ''
        });
        onTeacherAdded(); // Refresh the teachers list
        onClose(); // Close modal
        alert('Teacher added successfully!');
      } else {
        setError(data.message || 'Failed to add teacher');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error adding teacher:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>👨‍🏫 Add New Teacher</h3>
          <button className="close-btn" onClick={onClose} type="button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="teacher-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Sarah Johnson"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="+919876543211"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="sarah.johnson@school.com"
              />
            </div>
            <div className="form-group">
              <label>Class Assigned</label>
              <select
                name="class_name"
                value={formData.class_name}
                onChange={handleInputChange}
              >
                <option value="">Select Class</option>
                <option value="Pre-K A">Nursery</option>
                <option value="Pre-K B">LKG</option>
                <option value="Nursery A">UKG</option>
                <option value="Nursery B">Tuition Class 1st-4th</option>
                <option value="Kindergarten">Tuition Class 5th-7th</option>
                <option value="Kindergarten">Tuition Class 8th-10th</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subjects}
                onChange={handleInputChange}
                placeholder="e.g. Mathematics, English, Arts & Crafts"
              />
            </div>
            <div className="form-group">
              <label>Experience (Years)</label>
              <input
                type="number"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleInputChange}
                placeholder="5"
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Qualification</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                placeholder="B.Ed, Early Childhood Development"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-btn"
              style={{ 
                background: '#f5f5f5', 
                color: '#333', 
                border: '1px solid #ddd', 
                padding: '12px 20px', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontWeight: '500' 
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="submit-btn"
              style={{ 
                background: loading ? '#cccccc' : '#4CAF50', 
                color: 'white', 
                border: 'none', 
                padding: '12px 20px', 
                borderRadius: '6px', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                fontWeight: '500' 
              }}
            >
              {loading ? 'Adding...' : '👨‍🏫 Add Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeacherModal;
