import React, { useState, useEffect } from 'react';
import api from '../api';
import { Modal, Button, Input, Select } from './ui';
import toast from 'react-hot-toast';

const EditTeacherModal = ({ isOpen, onClose, onTeacherUpdated, teacher }) => {
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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && teacher) {
      setFormData({
        name: teacher.name || '',
        phone_number: teacher.phone_number || '',
        email: teacher.email || '',
        class_name: teacher.class_name || '',
        experience_years: teacher.experience_years || '',
        qualification: teacher.qualification || '',
        subject: teacher.subject || ''
      });
      setErrors({});
    }
  }, [isOpen, teacher]);

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
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.class_name.trim()) newErrors.class_name = 'Class name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.experience_years && (isNaN(formData.experience_years) || formData.experience_years < 0)) {
      newErrors.experience_years = 'Please enter a valid number of years';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : 0
      };

      const { data } = await api.put(`/teachers/${teacher.id}`, submitData);

      if (data.success) {
        toast.success('Teacher updated successfully!');
        onTeacherUpdated?.(data.teacher);
        onClose();
      } else {
        toast.error(data.message || 'Failed to update teacher');
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
      const message = error.response?.data?.message || 'Failed to update teacher';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const qualificationOptions = [
    { value: 'bachelor', label: 'Bachelor\'s Degree' },
    { value: 'master', label: 'Master\'s Degree' },
    { value: 'diploma', label: 'Diploma in Early Childhood Education' },
    { value: 'certificate', label: 'Teaching Certificate' },
    { value: 'other', label: 'Other' }
  ];

  const subjectOptions = [
    { value: 'general', label: 'General Education' },
    { value: 'english', label: 'English' },
    { value: 'math', label: 'Mathematics' },
    { value: 'science', label: 'Science' },
    { value: 'art', label: 'Art & Crafts' },
    { value: 'music', label: 'Music' },
    { value: 'physical', label: 'Physical Education' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Teacher" size="lg">
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  required
                  placeholder="e.g. Sarah Johnson"
                />
                
                <Input
                  label="Phone Number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  error={errors.phone_number}
                  required
                  placeholder="+919876543210"
                />
                
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  placeholder="sarah.johnson@school.com"
                />
                
                <Input
                  label="Experience (Years)"
                  name="experience_years"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                  error={errors.experience_years}
                  placeholder="e.g. 5"
                />
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Class Name"
                  name="class_name"
                  value={formData.class_name}
                  onChange={handleInputChange}
                  error={errors.class_name}
                  required
                  placeholder="e.g. Morning Stars, Little Flowers"
                />
                
                <Select
                  label="Primary Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  options={subjectOptions}
                  placeholder="Select subject"
                />
                
                <div className="md:col-span-2">
                  <Select
                    label="Qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    options={qualificationOptions}
                    placeholder="Select qualification"
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
            Update Teacher
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default EditTeacherModal;