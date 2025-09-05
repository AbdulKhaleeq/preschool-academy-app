import React, { useState, useEffect } from 'react';
import './EditTeacherModal.css'; // We'll reuse AddTeacherModal.css
import api from '../api';

const EditTeacherModal = ({ isOpen, onClose, onTeacherUpdated, teacher }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    class_name: '',
    subject: '',
    experience_years: '',
    qualification: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form with teacher data when modal opens
  useEffect(() => {
    if (isOpen && teacher) {
      setFormData({
        name: teacher.name || '',
        phone_number: teacher.phone_number || '',
        email: teacher.email || '',
        class_name: teacher.class_name || '',
        subject: teacher.subject || '',
        experience_years: teacher.experience_years || '',
        qualification: teacher.qualification || ''
      });
      setErrors({});
    }
  }, [isOpen, teacher]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone_number.replace(/\D/g, ''))) {
      newErrors.phone_number = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.class_name.trim()) newErrors.class_name = 'Class name is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.experience_years || formData.experience_years < 0) {
      newErrors.experience_years = 'Experience years must be 0 or greater';
    }
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const { data } = await api.put(`/teachers/${teacher.id}`, {
        ...formData,
        experience_years: parseInt(formData.experience_years)
      });
      
      if (data.success) {
        onTeacherUpdated(data.teacher);
        onClose();
        alert('Teacher updated successfully!');
      } else {
        alert(data.message || 'Error updating teacher');
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
      alert('Error updating teacher. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !teacher) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Teacher</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="teacher-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Teacher Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter teacher name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone_number">Phone Number *</label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className={errors.phone_number ? 'error' : ''}
                placeholder="Enter phone number"
              />
              {errors.phone_number && <span className="error-message">{errors.phone_number}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter email address"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="class_name">Class *</label>
              <input
                type="text"
                id="class_name"
                name="class_name"
                value={formData.class_name}
                onChange={handleInputChange}
                className={errors.class_name ? 'error' : ''}
                placeholder="Enter class name"
              />
              {errors.class_name && <span className="error-message">{errors.class_name}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={errors.subject ? 'error' : ''}
                placeholder="Enter subject"
              />
              {errors.subject && <span className="error-message">{errors.subject}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="experience_years">Experience (Years) *</label>
              <input
                type="number"
                id="experience_years"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleInputChange}
                className={errors.experience_years ? 'error' : ''}
                placeholder="Enter years of experience"
                min="0"
              />
              {errors.experience_years && <span className="error-message">{errors.experience_years}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="qualification">Qualification *</label>
            <input
              type="text"
              id="qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleInputChange}
              className={errors.qualification ? 'error' : ''}
              placeholder="Enter qualification"
            />
            {errors.qualification && <span className="error-message">{errors.qualification}</span>}
          </div>

          <div className="form-buttons">
            <button 
              type="button" 
              onClick={onClose}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTeacherModal;
