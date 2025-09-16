import React, { useState, useEffect } from 'react';
import ParentDashboard from './ParentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import { motion } from 'framer-motion';
import { Button } from './ui';
import { 
  ArrowRightOnRectangleIcon, 
  ChevronDownIcon 
} from '@heroicons/react/24/outline';

const Dashboard = ({ user, onLogout }) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Close dropdown when user changes (navigation)
  useEffect(() => {
    setIsProfileDropdownOpen(false);
  }, [user]);

  const renderDashboard = () => {
    switch(user.role) {
      case 'parent':
        return <ParentDashboard user={user} />;
      case 'teacher':
        return <TeacherDashboard user={user} />;
      case 'admin':
        return <AdminDashboard user={user} />;
      default:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Invalid user role
              </h2>
              <p className="text-gray-600 mt-2">
                Please contact your administrator
              </p>
            </div>
          </div>
        );
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'parent': return '👨‍👩‍👧‍👦';
      case 'teacher': return '👩‍🏫';
      case 'admin': return '👨‍💼';
      default: return '👤';
    }
  };

  const getRoleTitle = (role) => {
    switch(role) {
      case 'parent': return 'Parent';
      case 'teacher': return 'Teacher';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="px-2 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <motion.img
                src="/MyLogo.png"
                alt="Wellington Kids Logo"
                className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
                whileHover={{ scale: 1.05 }}
              />
              <motion.h1 
                className="text-lg sm:text-xl font-bold text-gradient"
                whileHover={{ scale: 1.05 }}
              >
                Wellington Kids
              </motion.h1>
            </div>

            {/* User Profile with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="text-xl sm:text-2xl">{getRoleIcon(user.role)}</div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">
                    {getRoleTitle(user.role)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.name || user.phone}
                  </div>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                        <div className="text-sm font-medium text-gray-900">
                          Welcome, {getRoleTitle(user.role)}!
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.name || user.phone}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onLogout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="flex-1">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default Dashboard;
