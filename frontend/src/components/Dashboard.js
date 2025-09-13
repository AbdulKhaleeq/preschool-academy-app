import React from 'react';
import ParentDashboard from './ParentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import { motion } from 'framer-motion';
import { Button } from './ui';
import { 
  ArrowRightOnRectangleIcon, 
  SunIcon, 
  MoonIcon 
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard = ({ user, onLogout }) => {
  const { isDarkMode, toggleTheme } = useTheme();

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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Invalid user role
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <motion.h1 
                className="text-xl font-bold text-gradient"
                whileHover={{ scale: 1.05 }}
              >
                🎓 Preschool Academy
              </motion.h1>
            </div>

            {/* User info and actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="text-2xl">{getRoleIcon(user.role)}</div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Welcome, {getRoleTitle(user.role)}!
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user.name || user.phone}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                variant="ghost"
                onClick={onLogout}
                className="p-2"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span className="hidden sm:inline-block ml-2">Logout</span>
              </Button>
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
