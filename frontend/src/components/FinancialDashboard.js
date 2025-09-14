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

const FinancialDashboard = () => {
  const [activeView, setActiveView] = useState('main'); // 'main', 'fees', 'expenses'

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  const handleBackToMain = () => {
    setActiveView('main');
  };

  if (activeView === 'fees') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleBackToMain}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Financial Dashboard</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Collection</h1>
        </div>
        <FinancialManagement />
      </div>
    );
  }

  if (activeView === 'expenses') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleBackToMain}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Financial Dashboard</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Management</h1>
        </div>
        <ExpenseManagement />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fee Collection Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200 dark:hover:border-blue-700"
                onClick={() => handleViewChange('fees')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BanknotesIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fee Collection</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Track student fee payments, generate monthly reports, and manage fee collection for tuition students
                </p>
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Student Fees
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button className="w-full" variant="primary">
                Manage Fee Collection
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Expense Management Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-200 dark:hover:border-green-700"
                onClick={() => handleViewChange('expenses')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <ReceiptPercentIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Expense Management</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Track school expenses like salaries, utilities, supplies, and generate comprehensive expense reports
                </p>
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    School Expenses
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button className="w-full" variant="primary">
                Manage Expenses
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">This Month's Collections</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹0</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Fees</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">₹0</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Expenses</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹0</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹0</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FinancialDashboard;