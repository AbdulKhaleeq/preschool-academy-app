import React, { useState, useEffect } from 'react';
import api from '../api';
import { Card, Button, LoadingSpinner } from './ui';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const PendingDues = ({ user }) => {
  const [pendingDues, setPendingDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPending, setTotalPending] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      fetchPendingDues();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPendingDues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/fees/parent/${user.id}/dues`);
      
      if (response.data.success) {
        setPendingDues(response.data.pendingDues || []);
        setTotalPending(response.data.totalPending || 0);
      } else {
        setError('Failed to load pending dues');
      }
    } catch (error) {
      console.error('Error fetching pending dues:', error);
      setError('Unable to load pending dues. Please try again later.');
      setPendingDues([]);
      setTotalPending(0);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString()}`;
  };

  const getStatusColor = (monthYear) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // If due is from previous months, it's overdue
    if (monthYear.year < currentYear || 
        (monthYear.year === currentYear && monthYear.month < currentMonth)) {
      return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
    }
    
    // Current month due
    return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Dues</h2>
        </div>
        <Card className="p-6">
          <LoadingSpinner />
          <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
            Loading pending dues...
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Dues</h2>
        </div>
        <Card className="p-6">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Unable to Load Dues
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchPendingDues}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Dues</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your children's fee payments
          </p>
        </div>
        <Button onClick={fetchPendingDues} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${
              totalPending > 0 
                ? 'bg-red-100 dark:bg-red-900' 
                : 'bg-green-100 dark:bg-green-900'
            }`}>
              {totalPending > 0 ? (
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
              ) : (
                <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Total Pending Amount
              </h3>
              <p className={`text-2xl font-bold ${
                totalPending > 0 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {formatCurrency(totalPending)}
              </p>
            </div>
          </div>
          {pendingDues.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {pendingDues.length} pending payment{pendingDues.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Pending Dues List */}
      {pendingDues.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              All Caught Up!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You have no pending dues. All fees are up to date.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Outstanding Payments
          </h3>
          
          <AnimatePresence>
            {pendingDues.map((due, index) => (
              <motion.div
                key={`${due.fee_id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <Card className="p-4 border-l-4 border-l-red-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <CurrencyDollarIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {due.student_name}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span>{due.class_name}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{due.monthName} {due.year}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(due.amount)}
                      </div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        getStatusColor({ month: due.month, year: due.year })
                      }`}>
                        {due.year < new Date().getFullYear() || 
                         (due.year === new Date().getFullYear() && due.month < new Date().getMonth() + 1)
                          ? 'Overdue' 
                          : 'Due'
                        }
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Payment Instructions */}
      {pendingDues.length > 0 && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CurrencyDollarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Payment Instructions
              </h4>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Please contact the school administration to process your payment. 
                Once payment is confirmed by the admin, these dues will be automatically cleared from your account.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PendingDues;