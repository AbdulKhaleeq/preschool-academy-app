import React, { useState, useEffect } from 'react';
import api from '../api';
import { Card, Button, Input, Select } from './ui';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BanknotesIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const FinancialManagement = () => {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState({
    total_amount: 0,
    paid_amount: 0,
    unpaid_amount: 0,
    total_students: 0,
    paid_count: 0,
    unpaid_count: 0
  });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('unpaid');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);

  useEffect(() => {
    loadMonthlyFees();
  }, [currentMonth, currentYear]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMonthlyFees = async () => {
    setLoading(true);
    try {
      const [feesResponse, reportResponse] = await Promise.all([
        api.get(`/fees/monthly?month=${currentMonth}&year=${currentYear}`),
        api.get(`/fees/report?month=${currentMonth}&year=${currentYear}`)
      ]);

      if (feesResponse.data.success) {
        setFees(feesResponse.data.fees);
      }

      if (reportResponse.data.success) {
        setSummary(reportResponse.data.report);
      }
    } catch (error) {
      console.error('Error loading fees:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (studentId, isPaid) => {
    try {
      const response = await api.post(`/fees/${studentId}/status`, {
        month: currentMonth,
        year: currentYear,
        is_paid: isPaid
      });

      if (response.data.success) {
        toast.success(isPaid ? 'Marked as paid!' : 'Marked as unpaid!');
        loadMonthlyFees();
      }
    } catch (error) {
      console.error('Error updating fee status:', error);
      toast.error('Failed to update fee status');
    }
  };

  const handleGenerateNewMonth = async () => {
    try {
      const response = await api.post('/fees/generate-month', {
        month: currentMonth,
        year: currentYear
      });

      if (response.data.success) {
        toast.success(`Generated fees for ${response.data.generated} students`);
        loadMonthlyFees();
      }
    } catch (error) {
      console.error('Error generating new month:', error);
      toast.error('Failed to generate new month');
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await api.get(`/fees/report?month=${currentMonth}&year=${currentYear}`);
      if (response.data.success) {
        const report = response.data.report;
        const reportData = `
Financial Report - ${getMonthName(currentMonth)} ${currentYear}
=========================================

Summary:
- Total Students: ${report.total_students}
- Total Amount: ₹${report.total_amount.toFixed(2)}
- Paid Amount: ₹${report.paid_amount.toFixed(2)}
- Unpaid Amount: ₹${report.unpaid_amount.toFixed(2)}
- Paid Students: ${report.paid_count}
- Unpaid Students: ${report.unpaid_count}

Collection Rate: ${report.total_students > 0 ? ((report.paid_count / report.total_students) * 100).toFixed(1) : 0}%

Generated on: ${new Date().toLocaleString()}
        `;

        const blob = new Blob([reportData], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${currentMonth}-${currentYear}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast.success('Report downloaded successfully!');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  const loadAvailableStudents = async () => {
    try {
      const response = await api.get(`/fees/available-students?month=${currentMonth}&year=${currentYear}`);
      if (response.data.success) {
        setAvailableStudents(response.data.students);
      }
    } catch (error) {
      console.error('Error loading available students:', error);
      toast.error('Failed to load available students');
    }
  };

  const handleAddStudent = async (studentId, amount) => {
    try {
      const response = await api.post(`/fees/${studentId}/add`, {
        month: currentMonth,
        year: currentYear,
        amount: parseFloat(amount)
      });

      if (response.data.success) {
        toast.success('Student added to fee tracking!');
        setShowAddStudentModal(false);
        loadMonthlyFees();
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student to fees');
    }
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1)
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - 2 + i,
    label: (currentYear - 2 + i).toString()
  }));

  const filteredFees = fees.filter(fee => {
    if (activeTab === 'paid') return fee.is_paid;
    if (activeTab === 'unpaid') return !fee.is_paid;
    return true;
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Financial Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track monthly payments and generate financial reports
        </p>
      </div>

      {/* Month/Year Selector & Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Date Selectors */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
              options={monthOptions}
              className="min-w-[140px]"
            />
            <Select
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              options={yearOptions}
              className="min-w-[100px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleGenerateNewMonth}
              variant="outline"
              icon={CalendarDaysIcon}
              className="whitespace-nowrap"
            >
              Generate New Month
            </Button>
            <Button
              onClick={handleDownloadReport}
              variant="outline"
              icon={DocumentArrowDownIcon}
              className="whitespace-nowrap"
            >
              Download Report
            </Button>
            <Button
              onClick={() => {
                loadAvailableStudents();
                setShowAddStudentModal(true);
              }}
              icon={UserPlusIcon}
              className="whitespace-nowrap"
            >
              Add Student
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                  Total Amount
                </p>
                <p className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-100">
                  ₹{summary.total_amount.toFixed(2)}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {summary.total_students} students
                </p>
              </div>
              <BanknotesIcon className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 md:p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                  Paid Amount
                </p>
                <p className="text-2xl md:text-3xl font-bold text-green-900 dark:text-green-100">
                  ₹{summary.paid_amount.toFixed(2)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {summary.paid_count} payments
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 md:p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                  Unpaid Amount
                </p>
                <p className="text-2xl md:text-3xl font-bold text-red-900 dark:text-red-100">
                  ₹{summary.unpaid_amount.toFixed(2)}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {summary.unpaid_count} pending
                </p>
              </div>
              <XCircleIcon className="h-8 w-8 text-red-500" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
        <button
          onClick={() => setActiveTab('unpaid')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'unpaid'
              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-b-2 border-red-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Unpaid ({summary.unpaid_count})
        </button>
        <button
          onClick={() => setActiveTab('paid')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'paid'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-b-2 border-green-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Paid ({summary.paid_count})
        </button>
      </div>

      {/* Student Fee List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredFees.map((fee, index) => (
              <motion.div
                key={`${fee.student_id}-${fee.student_name}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {fee.student_name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{fee.class_name}</span>
                          <span>Roll #{fee.roll_no}</span>
                          <span className="font-semibold text-lg text-gray-900 dark:text-white">
                            ₹{fee.amount}
                          </span>
                        </div>
                      </div>
                      {fee.paid_date && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          Paid on {new Date(fee.paid_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        fee.is_paid
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      }`}>
                        {fee.is_paid ? 'Paid' : 'Unpaid'}
                      </span>
                      
                      <Button
                        onClick={() => handleMarkAsPaid(fee.student_id, !fee.is_paid)}
                        variant={fee.is_paid ? 'outline' : 'primary'}
                        size="sm"
                        icon={fee.is_paid ? XCircleIcon : CheckCircleIcon}
                        className="whitespace-nowrap"
                      >
                        {fee.is_paid ? 'Mark Unpaid' : 'Mark as Paid'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredFees.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-2">
                <BanknotesIcon className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No {activeTab} fees found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === 'unpaid' 
                  ? 'All fees have been collected for this month!' 
                  : 'No payments recorded for this month yet.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Student Modal */}
      <AddStudentToFeesModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        students={availableStudents}
        onAddStudent={handleAddStudent}
        month={getMonthName(currentMonth)}
        year={currentYear}
      />
    </div>
  );
};

// Add Student to Fees Modal Component
const AddStudentToFeesModal = ({ isOpen, onClose, students, onAddStudent, month, year }) => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent || !amount) {
      toast.error('Please select a student and enter an amount');
      return;
    }
    onAddStudent(selectedStudent, amount);
    setSelectedStudent('');
    setAmount('');
  };

  const studentOptions = students.map(student => ({
    value: student.id,
    label: `${student.name} (${student.class_name})`
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add Student to {month} {year} Fees
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Student
                </label>
                <Select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  options={[{ value: '', label: 'Choose a student...' }, ...studentOptions]}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fee Amount
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter fee amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={onClose} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Student
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FinancialManagement;