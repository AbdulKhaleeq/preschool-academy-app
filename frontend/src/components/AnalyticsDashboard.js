import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, LoadingSpinner } from './ui';
import { 
  ChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import api from '../api';

const AnalyticsDashboard = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [financialData, setFinancialData] = useState({
    monthlyCollections: 0,
    pendingFees: 0,
    monthlyExpenses: 0,
    netProfit: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate year options (current year and 2 years back)
  const yearOptions = [];
  for (let i = 0; i < 3; i++) {
    yearOptions.push(currentDate.getFullYear() - i);
  }

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch financial data whenever month/year changes
  useEffect(() => {
    fetchFinancialData();
  }, [selectedMonth, selectedYear]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Update the API endpoint to accept month/year parameters
      const response = await api.get(`/financial/summary?month=${selectedMonth}&year=${selectedYear}`);
      
      if (response.data.success) {
        setFinancialData(response.data.summary);
      } else {
        setError('Failed to load financial data');
      }
    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError('Error loading financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await api.get(`/financial/report?month=${selectedMonth}&year=${selectedYear}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial-report-${monthNames[selectedMonth - 1]}-${selectedYear}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Error downloading report. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Month/Year Selection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Financial Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            View financial performance for any month
          </p>
        </div>
        
        {/* Month/Year Selectors */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          <Button
            onClick={handleDownloadReport}
            variant="outline"
            className="flex items-center gap-2 whitespace-nowrap"
            disabled={loading}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Monthly Collections
                </p>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-gray-400">Loading...</span>
                  </div>
                ) : error ? (
                  <div className="text-red-500 font-semibold">Error</div>
                ) : (
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {financialData.monthlyCollections.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Pending Fees
                </p>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-gray-400">Loading...</span>
                  </div>
                ) : error ? (
                  <div className="text-red-500 font-semibold">Error</div>
                ) : (
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {financialData.pendingFees.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <CalendarIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Monthly Expenses
                </p>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-gray-400">Loading...</span>
                  </div>
                ) : error ? (
                  <div className="text-red-500 font-semibold">Error</div>
                ) : (
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {financialData.monthlyExpenses.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <ChartBarIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Net Profit
                </p>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-gray-400">Loading...</span>
                  </div>
                ) : error ? (
                  <div className="text-red-500 font-semibold">Error</div>
                ) : (
                  <p className={`text-2xl font-bold ${
                    financialData.netProfit >= 0 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {financialData.netProfit.toLocaleString()}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-full ${
                financialData.netProfit >= 0 
                  ? 'bg-blue-100 dark:bg-blue-900' 
                  : 'bg-red-100 dark:bg-red-900'
              }`}>
                <ChartBarIcon className={`h-6 w-6 ${
                  financialData.netProfit >= 0 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-red-600 dark:text-red-400'
                }`} />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Summary Card */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {monthNames[selectedMonth - 1]} {selectedYear} Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Revenue</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Collections Received:</span>
                    <span className="font-medium text-green-600">{financialData.monthlyCollections.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Pending Collections:</span>
                    <span className="font-medium text-orange-600">{financialData.pendingFees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total Revenue Potential:</span>
                    <span className="font-bold">{(financialData.monthlyCollections + financialData.pendingFees).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Expenses:</span>
                    <span className="font-medium text-red-600">{financialData.monthlyExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Net Profit/Loss:</span>
                    <span className={`font-medium ${
                      financialData.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {financialData.netProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Profit Margin:</span>
                    <span className={`font-bold ${
                      financialData.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {financialData.monthlyCollections > 0 
                        ? `${((financialData.netProfit / financialData.monthlyCollections) * 100).toFixed(1)}%`
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;