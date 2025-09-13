import React, { useEffect, useState } from 'react';
import api from '../api';
import { Modal, Button, Input, Select, TextArea, Badge } from './ui';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  PhoneIcon, 
  HeartIcon,
  AcademicCapIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EditStudentModal = ({ isOpen, onClose, student, onSaved }) => {
  const [form, setForm] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && student) {
      setForm({ ...student });
      setError('');
      
      api.get('/teachers')
        .then(r => setTeachers(r.data.teachers || []))
        .catch(() => toast.error('Failed to load teachers'));
    }
  }, [isOpen, student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast.error('Student name is required');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const payload = {
        name: form.name,
        age: form.age,
        parent_phone: form.parent_phone,
        father_phone: form.father_phone,
        teacher_name: form.teacher_name,
        class_name: form.class_name,
        date_of_birth: form.date_of_birth,
        emergency_contact: form.emergency_contact,
        medical_notes: form.medical_notes,
        program: form.program,
        notes: form.notes
      };
      
      const { data } = await api.put(`/students-update/${student.id}`, payload);
      
      if (data.success) {
        toast.success('Student updated successfully!');
        onSaved?.(data.student);
        onClose();
      } else {
        setError(data.message || 'Failed to update student');
      }
    } catch (err) {
      console.error('Error updating student:', err);
      setError('Server error. Please try again.');
      toast.error('Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Student"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <UserIcon className="h-5 w-5 text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Basic Information
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Student Name"
              name="name"
              value={form.name || ''}
              onChange={handleChange}
              required
              placeholder="Enter student's full name"
            />
            
            <Input
              label="Age"
              name="age"
              type="number"
              value={form.age || ''}
              onChange={handleChange}
              placeholder="Age in years"
            />
            
            <Input
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={form.date_of_birth || ''}
              onChange={handleChange}
            />
            
            <Select
              label="Program"
              name="program"
              value={form.program || ''}
              onChange={handleChange}
            >
              <option value="">Select Program</option>
              <option value="Toddler">Toddler</option>
              <option value="PreK">PreK</option>
              <option value="Kindergarten">Kindergarten</option>
              <option value="After School">After School</option>
            </Select>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <AcademicCapIcon className="h-5 w-5 text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Academic Information
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Teacher"
              name="teacher_name"
              value={form.teacher_name || ''}
              onChange={handleChange}
            >
              <option value="">Select Teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.name}>
                  {teacher.name}
                </option>
              ))}
            </Select>
            
            <Input
              label="Class Name"
              name="class_name"
              value={form.class_name || ''}
              onChange={handleChange}
              placeholder="e.g., Butterflies, Sunflowers"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <PhoneIcon className="h-5 w-5 text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Contact Information
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Parent Phone"
              name="parent_phone"
              type="tel"
              value={form.parent_phone || ''}
              onChange={handleChange}
              placeholder="Primary parent phone"
            />
            
            <Input
              label="Father Phone"
              name="father_phone"
              type="tel"
              value={form.father_phone || ''}
              onChange={handleChange}
              placeholder="Father's phone number"
            />
            
            <div className="md:col-span-2">
              <Input
                label="Emergency Contact"
                name="emergency_contact"
                value={form.emergency_contact || ''}
                onChange={handleChange}
                placeholder="Emergency contact name and phone"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <DocumentTextIcon className="h-5 w-5 text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Additional Information
            </h3>
          </div>
          
          <div className="space-y-4">
            <TextArea
              label="Medical Notes"
              name="medical_notes"
              value={form.medical_notes || ''}
              onChange={handleChange}
              placeholder="Any allergies, medical conditions, or special needs"
              rows={3}
            />
            
            <TextArea
              label="General Notes"
              name="notes"
              value={form.notes || ''}
              onChange={handleChange}
              placeholder="Any additional notes about the student"
              rows={3}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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
            Update Student
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditStudentModal;
