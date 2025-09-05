import React, { useState, useEffect } from 'react';
import './AddStudentModal.css';
import api from '../api';

const AddStudentModal = ({ isOpen, onClose, onStudentAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    parent_phone: '',
    teacher_id: '',
    class_name: '',
    date_of_birth: '',
    emergency_contact: '',
    medical_notes: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch teachers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTeachers();
      // Reset form when modal opens
      setFormData({
        name: '',
        age: '',
        parent_phone: '',
        teacher_id: '',
        class_name: '',
        date_of_birth: '',
        emergency_contact: '',
        medical_notes: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/teachers');
      if (data.success) {
        setTeachers(data.teachers);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

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

  const handleTeacherChange = (e) => {
    const teacherId = e.target.value;
    const selectedTeacher = teachers.find(t => t.id.toString() === teacherId);
    
    setFormData(prev => ({
      ...prev,
      teacher_id: teacherId,
      class_name: selectedTeacher ? selectedTeacher.class_name : prev.class_name
    }));
    
    if (errors.teacher_id) {
      setErrors(prev => ({
        ...prev,
        teacher_id: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age || formData.age < 1 || formData.age > 18) {
      newErrors.age = 'Age must be between 1 and 10';
    }
    if (!formData.parent_phone.trim()) {
      newErrors.parent_phone = 'Parent phone is required';
    } else if (!/^\d{10}$/.test(formData.parent_phone.replace(/\D/g, ''))) {
      newErrors.parent_phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.teacher_id) newErrors.teacher_id = 'Please select a teacher';
    if (!formData.class_name.trim()) newErrors.class_name = 'Class name is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.emergency_contact.trim()) {
      newErrors.emergency_contact = 'Emergency contact is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Get selected teacher's name for the request
      const selectedTeacher = teachers.find(t => t.id.toString() === formData.teacher_id);
      
      const studentData = {
        ...formData,
        teacher_name: selectedTeacher ? selectedTeacher.name : '',
        age: parseInt(formData.age)
      };

      const { data } = await api.post('/students', studentData);
      
      if (data.success) {
        onStudentAdded(data.student);
        onClose();
        alert('Student added successfully!');
      } else {
        alert(data.message || 'Error adding student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Student</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="student-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Student Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter student name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="age">Age *</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className={errors.age ? 'error' : ''}
                placeholder="Enter age"
                min="1"
                max="18"
              />
              {errors.age && <span className="error-message">{errors.age}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date_of_birth">Date of Birth *</label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className={errors.date_of_birth ? 'error' : ''}
              />
              {errors.date_of_birth && <span className="error-message">{errors.date_of_birth}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="parent_phone">Parent Phone *</label>
              <input
                type="tel"
                id="parent_phone"
                name="parent_phone"
                value={formData.parent_phone}
                onChange={handleInputChange}
                className={errors.parent_phone ? 'error' : ''}
                placeholder="Enter parent phone number"
              />
              {errors.parent_phone && <span className="error-message">{errors.parent_phone}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="teacher_id">Select Teacher *</label>
              <select
                id="teacher_id"
                name="teacher_id"
                value={formData.teacher_id}
                onChange={handleTeacherChange}
                className={errors.teacher_id ? 'error' : ''}
              >
                <option value="">Select a teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} - {teacher.class_name}
                  </option>
                ))}
              </select>
              {errors.teacher_id && <span className="error-message">{errors.teacher_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="class_name">Class Name *</label>
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

          <div className="form-group">
            <label htmlFor="emergency_contact">Emergency Contact *</label>
            <input
              type="tel"
              id="emergency_contact"
              name="emergency_contact"
              value={formData.emergency_contact}
              onChange={handleInputChange}
              className={errors.emergency_contact ? 'error' : ''}
              placeholder="Enter emergency contact number"
            />
            {errors.emergency_contact && <span className="error-message">{errors.emergency_contact}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="medical_notes">Medical Notes</label>
            <textarea
              id="medical_notes"
              name="medical_notes"
              value={formData.medical_notes}
              onChange={handleInputChange}
              placeholder="Enter any medical notes or allergies (optional)"
              rows="3"
            />
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
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
