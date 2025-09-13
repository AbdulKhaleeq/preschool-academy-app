import React, { useState, useEffect } from 'react';
import api from '../api';
import { Modal, Button, Input, TextArea, Badge } from './ui';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  AcademicCapIcon,
  BookOpenIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

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

    if (!formData.name.trim()) {
      newErrors.name = 'Teacher name is required';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Invalid phone number format';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.class_name.trim()) {
      newErrors.class_name = 'Class name is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.qualification.trim()) {
      newErrors.qualification = 'Qualification is required';
    }

    if (formData.experience_years && (isNaN(formData.experience_years) || formData.experience_years < 0)) {
      newErrors.experience_years = 'Experience must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const response = await api.put(`/teachers/${teacher.id}`, formData);

      if (response.data.success) {
        toast.success('Teacher updated successfully!');
        onTeacherUpdated?.(response.data.teacher);
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to update teacher');
      }
    } catch (error) {
      console.error('Error updating teacher:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update teacher. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !teacher) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Teacher"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <UserIcon className="h-5 w-5 text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Personal Information
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              required
              placeholder="Enter teacher's full name"
            />
            
            <Input
              label="Phone Number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleInputChange}
              error={errors.phone_number}
              required
              placeholder="Enter phone number"
            />
            
            <div className="md:col-span-2">
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                required
                placeholder="Enter email address"
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <AcademicCapIcon className="h-5 w-5 text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Professional Information
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Class Name"
              name="class_name"
              value={formData.class_name}
              onChange={handleInputChange}
              error={errors.class_name}
              required
              placeholder="e.g., Butterflies, Sunflowers"
            />
            
            <Input
              label="Subject/Specialty"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              error={errors.subject}
              required
              placeholder="e.g., Mathematics, Arts & Crafts"
            />
            
            <Input
              label="Years of Experience"
              name="experience_years"
              type="number"
              min="0"
              value={formData.experience_years}
              onChange={handleInputChange}
              error={errors.experience_years}
              placeholder="Years of teaching experience"
            />
            
            <div className="md:col-span-1">
              <Input
                label="Qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleInputChange}
                error={errors.qualification}
                required
                placeholder="e.g., B.Ed, M.Ed, Early Childhood"
              />
            </div>
          </div>
        </div>

        {/* Teacher Stats */}
        {teacher && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 p-4 rounded-lg border border-primary-100 dark:border-primary-800"
          >
            <div className="flex items-center space-x-2 mb-3">
              <StarIcon className="h-5 w-5 text-primary-600" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Teacher Statistics
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">
                  {teacher.student_count || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Students
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <div className="text-2xl font-bold text-secondary-600">
                  {new Date().getFullYear() - new Date(teacher.created_at || new Date()).getFullYear() || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Years Here
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <Badge variant="success" className="text-sm">
                  Active
                </Badge>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Status
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="px-6"
          >
            Update Teacher
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTeacherModal;
