import React, { useEffect, useState } from 'react';
import api from '../api';
import { Modal, Button, Input, Select, Badge } from './ui';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  PhoneIcon, 
  ShieldCheckIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EditUserModal = ({ isOpen, onClose, user, onUpdated }) => {
  const [form, setForm] = useState({ 
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

  useEffect(() => {
    if (isOpen && user) {
      setForm({ 
        name: user.name || '', 
        phone_number: user.phone_number || '', 
        role: user.role || 'parent', 
        is_active: !!user.is_active 
      });
      setErrors({});
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Restrict phone number field to 10 digits only
    if (name === 'phone_number') {
      // Remove all non-digit characters and limit to 10 digits
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setForm(prev => ({ 
        ...prev, 
        [name]: digitsOnly 
      }));
    } else {
      setForm(prev => ({ 
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

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!form.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else {
      const cleanedPhone = form.phone_number.replace(/\D/g, '');
      if (cleanedPhone.length !== 10) {
        newErrors.phone_number = 'Phone number must be exactly 10 digits';
      }
    }

    if (!form.role) {
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
      const cleanedPhone = form.phone_number.replace(/\D/g, '');
      const payload = { ...form, phone_number: cleanedPhone };
      
      const { data } = await api.put(`/users/${user.id}`, payload);
      
      if (data.success) {
        toast.success('User updated successfully!');
        onUpdated?.(data.user);
        onClose();
      } else {
        toast.error(data.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      const msg = err?.response?.data?.message || 'Server error. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

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

  const currentRoleInfo = roleInfo[form.role];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit User - ${user.name}`}
      size="lg"
    >
      <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-6">
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
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="Enter user's full name"
            />
            
            <Input
              label="Phone Number"
              name="phone_number"
              type="tel"
              value={form.phone_number}
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
              value={form.role}
              onChange={handleChange}
              options={roleOptions}
              error={errors.role}
              required
            />

            {/* Role Information */}
            {currentRoleInfo && (
              <motion.div
                key={form.role}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <currentRoleInfo.icon className={`h-5 w-5 mt-0.5 ${currentRoleInfo.color}`} />
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {form.role}
                    </span>
                    <Badge variant="info" className="text-xs">
                      {form.role}
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
          <div className="flex items-center justify-between mb-4">
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
                checked={form.is_active}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {form.is_active ? 'Active' : 'Inactive'}
              </span>
            </label>
          </div>

          {/* User metadata */}
          {user && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-3 w-3" />
                  <span>
                    Created: {user.created_at 
                      ? new Date(user.created_at).toLocaleDateString()
                      : 'Unknown'
                    }
                  </span>
                </div>
                <div>
                  ID: {user.id}
                </div>
              </div>
            </div>
          )}
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
            form="edit-user-form"
            loading={loading}
          >
            Update User
          </Button>
        </Modal.Footer>
    </Modal>
  );
};

export default EditUserModal;
