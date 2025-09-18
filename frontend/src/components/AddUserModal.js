import React, { useState } from 'react';
import api from '../api';
import { Modal, Button, Input, Select, Badge } from './ui';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  PhoneIcon, 
  ShieldCheckIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AddUserModal = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    phone_number: '', 
    role: 'parent', 
    is_active: true 
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const roleOptions = [
    { value: 'parent', label: 'Parent' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'admin', label: 'Administrator' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Restrict phone number field to 10 digits only
    if (name === 'phone_number') {
      // Remove all non-digit characters and limit to 10 digits
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ 
        ...prev, 
        [name]: digitsOnly 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else {
      const cleanedPhone = formData.phone_number.replace(/\D/g, '');
      if (cleanedPhone.length !== 10) {
        newErrors.phone_number = 'Phone number must be exactly 10 digits';
      }
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
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
      const cleanedPhone = formData.phone_number.replace(/\D/g, '');
      const payload = { ...formData, phone_number: cleanedPhone };
      
      const { data } = await api.post('/users', payload);
      
      if (data.success) {
        toast.success('User created successfully!');
        onCreated?.(data.user);
        onClose();
        setFormData({ name: '', phone_number: '', role: 'parent', is_active: true });
        setErrors({});
      } else {
        toast.error(data.message || 'Failed to create user');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      toast.error('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const roleInfo = {
    parent: {
      icon: UserIcon,
      description: 'Can view their children\'s information and communicate with teachers',
      color: 'text-blue-600'
    },
    teacher: {
      icon: UserGroupIcon,
      description: 'Can manage students, create reports, and communicate with parents',
      color: 'text-green-600'
    },
    admin: {
      icon: ShieldCheckIcon,
      description: 'Full system access and administrative privileges',
      color: 'text-purple-600'
    }
  };

  const currentRoleInfo = roleInfo[formData.role];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New User"
      size="lg"
    >
      <form id="add-user-form" onSubmit={handleSubmit} className="space-y-6">
        {/* User Information */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <UserIcon className="h-5 w-5 text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              User Information
            </h3>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="Enter user's full name"
            />
            
            <Input
              label="Phone Number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleChange}
              error={errors.phone_number}
              required
              placeholder="9876543210"
              maxLength="10"
              pattern="[0-9]{10}"
            />
          </div>
        </div>

        {/* Role Selection */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <ShieldCheckIcon className="h-5 w-5 text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              User Role
            </h3>
          </div>
          
          <div className="space-y-4">
            <Select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={roleOptions}
              error={errors.role}
              required
            />

            {/* Role Information */}
            {currentRoleInfo && (
              <motion.div
                key={formData.role}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <currentRoleInfo.icon className={`h-5 w-5 mt-0.5 ${currentRoleInfo.color}`} />
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {formData.role}
                    </span>
                    <Badge variant="info" className="text-xs">
                      {formData.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentRoleInfo.description}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Account Status
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active users can log in and use the system
              </p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {formData.is_active ? 'Active' : 'Inactive'}
              </span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        </form>
        
        <Modal.Footer>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-user-form"
            loading={loading}
          >
            Add User
          </Button>
        </Modal.Footer>
    </Modal>
  );
};

export default AddUserModal;
