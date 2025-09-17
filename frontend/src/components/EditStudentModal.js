import React, { useEffect, useState } from 'react';
import api from '../api';
import { Modal, Button, Input, Select } from './ui';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const EditStudentModal = ({ isOpen, onClose, student, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    parent_phone: '',
    teacher_id: '',
    class_name: '',
    date_of_birth: '',
    emergency_contact: '',
    medical_notes: '',
    program: '',
    fee_amount: '',
    notes: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Helper function to format date for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    // Handle date string in YYYY-MM-DD format directly to avoid timezone issues
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    
    // For other date formats, parse carefully
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    // Use local date components to avoid timezone shift
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (isOpen && student) {
      // Handle both old and new data structures for backward compatibility
      const parentPhone = student.parent_phone || student.mother_phone || student.father_phone || '';
      const teacherId = student.teacher_id || (student.teacher_name ? '' : '');
      
      setFormData({
        name: student.name || '',
        age: student.age || '',
        parent_phone: parentPhone,
        teacher_id: teacherId,
        class_name: student.class_name || '',
        date_of_birth: formatDateForInput(student.date_of_birth),
        emergency_contact: student.emergency_contact || '',
        medical_notes: student.medical_notes || '',
        program: student.program || '',
        fee_amount: student.fee_amount || '',
        notes: student.notes || ''
      });
      setErrors({});
      fetchTeachers();
    }
  }, [isOpen, student]);

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/teachers/users');
      if (data.success) {
        setTeachers(data.teachers);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age || formData.age < 1 || formData.age > 18) newErrors.age = 'Age must be between 1 and 18';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.class_name.trim()) newErrors.class_name = 'Class name is required';
    if (!formData.teacher_id) newErrors.teacher_id = 'Please select a teacher';
    if (!formData.parent_phone.trim()) newErrors.parent_phone = 'Parent phone is required';
    if (!formData.program) newErrors.program = 'Program is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const studentData = {
        ...formData,
        age: parseInt(formData.age)
      };
      
      const { data } = await api.put(`/students/${student.id}`, studentData);
      
      if (data.success) {
        toast.success('Student updated successfully!');
        onSaved?.(data.student);
        onClose();
      } else {
        toast.error(data.message || 'Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      const message = error.response?.data?.message || 'Failed to update student';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const teacherOptions = teachers.map(teacher => ({
    value: teacher.id,
    label: `${teacher.name} - ${teacher.phone_number || 'No phone'}`
  }));

  const programOptions = [
    { value: 'School', label: 'School' },
    { value: 'Tuition', label: 'Tuition' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student" size="lg">
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-6">
            {/* Student Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Student Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  required
                  placeholder="Enter student's full name"
                />
                
                <Input
                  label="Age"
                  name="age"
                  type="number"
                  min="1"
                  max="18"
                  value={formData.age}
                  onChange={handleInputChange}
                  error={errors.age}
                  required
                  placeholder="Enter age"
                />
                
                <Input
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  error={errors.date_of_birth}
                  required
                />
                
                <Select
                  label="Program"
                  name="program"
                  value={formData.program}
                  onChange={handleInputChange}
                  options={programOptions}
                  error={errors.program}
                  required
                  placeholder="Select program"
                />
                
                <Input
                  label="Monthly Fee Amount"
                  type="number"
                  name="fee_amount"
                  value={formData.fee_amount}
                  onChange={handleInputChange}
                  error={errors.fee_amount}
                  placeholder="Enter monthly fee amount"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Class Assignment */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Class Assignment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Teacher"
                  name="teacher_id"
                  value={formData.teacher_id}
                  onChange={handleInputChange}
                  options={teacherOptions}
                  error={errors.teacher_id}
                  required
                  placeholder="Select teacher"
                />
                
                <Input
                  label="Class Name"
                  name="class_name"
                  value={formData.class_name}
                  onChange={handleInputChange}
                  error={errors.class_name}
                  required
                  placeholder="e.g., Morning Stars, Little Flowers"
                />
              </div>
            </div>

            {/* Parent Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Parent Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Parent Phone"
                  name="parent_phone"
                  type="tel"
                  value={formData.parent_phone}
                  onChange={handleInputChange}
                  error={errors.parent_phone}
                  required
                  placeholder="+919876543210"
                />
                
                <Input
                  label="Emergency Contact"
                  name="emergency_contact"
                  type="tel"
                  value={formData.emergency_contact}
                  onChange={handleInputChange}
                  placeholder="+919876543210"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Additional Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Medical Notes</label>
                  <textarea
                    name="medical_notes"
                    value={formData.medical_notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-input resize-none"
                    placeholder="Any allergies, medical conditions, or special requirements..."
                  />
                </div>
                
                <div>
                  <label className="form-label">Additional Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="form-input resize-none"
                    placeholder="Any additional information about the student..."
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Update Student
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default EditStudentModal;