import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from './ui';
import { 
  BanknotesIcon, 
  ReceiptPercentIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import FinancialManagement from './FinancialManagement'; // Current fee tracking
import ExpenseManagement from './ExpenseManagement'; // New expense tracking
import AnalyticsDashboard from './AnalyticsDashboard'; // Financial analytics

const FinancialDashboard = () => {
  const [activeView, setActiveView] = useState('main'); // 'main', 'fees', 'expenses', 'analytics'

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  const handleBackToMain = () => {
    setActiveView('main');
  };

  if (activeView === 'analytics') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
          <Button
            onClick={handleBackToMain}
            variant="outline"
            className="flex items-center justify-center space-x-2 w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Financial Dashboard</span>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center sm:text-left">
            Financial Analytics
          </h1>
        </div>
        <AnalyticsDashboard />
      </div>
    );
  }

  if (activeView === 'fees') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
          <Button
            onClick={handleBackToMain}
            variant="outline"
            className="flex items-center justify-center space-x-2 w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Financial Dashboard</span>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center sm:text-left">
            Fee Collection
          </h1>
        </div>
        <FinancialManagement />
      </div>
    );
  }

  if (activeView === 'expenses') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
          <Button
            onClick={handleBackToMain}
            variant="outline"
            className="flex items-center justify-center space-x-2 w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Financial Dashboard</span>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white text-center sm:text-left">
            Expense Management
          </h1>
        </div>
        <ExpenseManagement />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Financial Management
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose an option to manage your finances
        </p>
      </div>

      {/* Main Options Cards - Mobile First */}
      <div className="space-y-4 mb-6">
        {/* Fee Collection Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-200 dark:hover:border-blue-700 active:scale-[0.98]"
                onClick={() => handleViewChange('fees')}>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                  <BanknotesIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Fee Collection
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                    Track student fee payments and generate monthly reports
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Student Fees
              </span>
              <Button className="px-4 py-2 text-sm" variant="primary">
                Manage →
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Expense Management Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-full"
        >
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-green-200 dark:hover:border-green-700 active:scale-[0.98]"
                onClick={() => handleViewChange('expenses')}>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
                  <ReceiptPercentIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Expense Management
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                    Record and categorize school expenses with detailed tracking
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                School Expenses
              </span>
              <Button className="px-4 py-2 text-sm" variant="primary">
                Manage →
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Analytics Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="w-full"
        >
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-purple-200 dark:hover:border-purple-700 active:scale-[0.98]"
                onClick={() => handleViewChange('analytics')}>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg flex-shrink-0">
                  <svg className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Analytics & Reports
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                    View comprehensive financial analytics with month/year selection and downloadable reports
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                Financial Reports
              </span>
              <Button className="px-4 py-2 text-sm" variant="primary">
                Manage →
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FinancialDashboard;