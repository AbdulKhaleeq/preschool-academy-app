import React, { useState, useEffect } from 'react';
import './AddStudentModal.css';
import api from '../api';

const AddStudentModal = ({ isOpen, onClose, onStudentAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    mother_phone: '',
    father_phone: '',
    teacher_name: '',
    class_name: '',
    date_of_birth: '',
    emergency_contact: '',
    medical_notes: '',
    program: '',
    notes: ''
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
        mother_phone: '',
        father_phone: '',
        teacher_name: '',
        class_name: '',
        date_of_birth: '',
        emergency_contact: '',
        medical_notes: '',
        program: '',
        notes: ''
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
    if (!formData.age || formData.age < 1 || formData.age > 18) newErrors.age = 'Age must be between 1 and 18';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.class_name.trim()) newErrors.class_name = 'Class name is required';
    if (!formData.teacher_name) newErrors.teacher_name = 'Please select a teacher';
    if (!formData.mother_phone.trim()) newErrors.mother_phone = 'Mother\'s phone is required';
    if (!formData.father_phone.trim()) newErrors.father_phone = 'Father\'s phone is required';
    if (!formData.program) newErrors.program = 'Program is required';
    if (!['mother','father'].includes(formData.primary_contact || 'mother')) {
      // normalize default selection
      setFormData(prev => ({ ...prev, primary_contact: 'mother' }));
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const parentPhone = (formData.primary_contact === 'father' ? formData.father_phone : formData.mother_phone) || '';
      const studentData = {
        ...formData,
        parent_phone: parentPhone,
        age: parseInt(formData.age)
      };
      const { data } = await api.post('/students', studentData);
      if (data.success) {
        onStudentAdded(data.student);
        onClose();
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
              <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className={errors.name ? 'error' : ''} placeholder="Enter student name" />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="age">Age *</label>
              <input type="number" id="age" name="age" value={formData.age} onChange={handleInputChange} className={errors.age ? 'error' : ''} placeholder="Enter age" min="1" max="18" />
              {errors.age && <span className="error-message">{errors.age}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date_of_birth">Date of Birth *</label>
              <input type="date" id="date_of_birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} className={errors.date_of_birth ? 'error' : ''} />
              {errors.date_of_birth && <span className="error-message">{errors.date_of_birth}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="class_name">Class Name *</label>
              <input type="text" id="class_name" name="class_name" value={formData.class_name} onChange={handleInputChange} className={errors.class_name ? 'error' : ''} placeholder="Enter class name" />
              {errors.class_name && <span className="error-message">{errors.class_name}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="teacher_name">Select Teacher *</label>
              <select id="teacher_name" name="teacher_name" value={formData.teacher_name} onChange={handleInputChange} className={errors.teacher_name ? 'error' : ''}>
                <option value="">Select a teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.name}>{teacher.name} - {teacher.class_name}</option>
                ))}
              </select>
              {errors.teacher_name && <span className="error-message">{errors.teacher_name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="program">Program *</label>
              <select id="program" name="program" value={formData.program} onChange={handleInputChange} className={errors.program ? 'error' : ''}>
                <option value="">Select</option>
                <option value="School">School</option>
                <option value="Tuition">Tuition</option>
              </select>
              {errors.program && <span className="error-message">{errors.program}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mother_phone">Mother's Phone *</label>
              <input type="tel" id="mother_phone" name="mother_phone" value={formData.mother_phone} onChange={handleInputChange} className={errors.mother_phone ? 'error' : ''} placeholder="Enter mother's phone number" />
              {errors.mother_phone && <span className="error-message">{errors.mother_phone}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="father_phone">Father's Phone *</label>
              <input type="tel" id="father_phone" name="father_phone" value={formData.father_phone} onChange={handleInputChange} className={errors.father_phone ? 'error' : ''} placeholder="Enter father's phone number" />
              {errors.father_phone && <span className="error-message">{errors.father_phone}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="primary_contact">Primary Contact *</label>
              <select id="primary_contact" name="primary_contact" value={formData.primary_contact || 'mother'} onChange={handleInputChange}>
                <option value="mother">Mother</option>
                <option value="father">Father</option>
              </select>
            </div>
            <div className="form-group"></div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="emergency_contact">Emergency Contact</label>
              <input type="tel" id="emergency_contact" name="emergency_contact" value={formData.emergency_contact} onChange={handleInputChange} placeholder="Enter emergency contact number" />
            </div>
            <div className="form-group">
              <label htmlFor="medical_notes">Medical Notes</label>
              <textarea id="medical_notes" name="medical_notes" value={formData.medical_notes} onChange={handleInputChange} placeholder="Enter any medical notes or allergies (optional)" rows="3" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Any notes" rows="3" />
          </div>

          <div className="form-buttons">
            <button type="button" onClick={onClose} className="cancel-button" disabled={loading}>Cancel</button>
            <button type="submit" className="submit-button" disabled={loading}>{loading ? 'Saving...' : 'Save Student'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
