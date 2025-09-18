import React, { useState, useEffect } from 'react';
import api, { formatDateForAPI } from '../api';
import { Card, Button, Input, Select } from './ui';
import ConfirmModal from './ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    expensesByCategory: {},
    monthlyTotal: 0
  });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null });

  // Expense categories
  const expenseCategories = [
    { value: 'salaries', label: 'Salaries & Wages', icon: '👥' },
    { value: 'utilities', label: 'Utilities (Electricity, Water)', icon: '⚡' },
    { value: 'supplies', label: 'Educational Supplies', icon: '📚' },
    { value: 'maintenance', label: 'Maintenance & Repairs', icon: '🔧' },
    { value: 'transport', label: 'Transportation', icon: '🚐' },
    { value: 'food', label: 'Food & Snacks', icon: '🍽️' },
    { value: 'rent', label: 'Rent & Lease', icon: '🏢' },
    { value: 'insurance', label: 'Insurance', icon: '🛡️' },
    { value: 'marketing', label: 'Marketing & Advertising', icon: '📢' },
    { value: 'other', label: 'Other Expenses', icon: '💼' }
  ];

  useEffect(() => {
    loadMonthlyExpenses();
  }, [currentMonth, currentYear]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMonthlyExpenses = async () => {
    setLoading(true);
    try {
      const [expensesResponse, summaryResponse] = await Promise.all([
        api.get(`/expenses/monthly?month=${currentMonth}&year=${currentYear}`),
        api.get(`/expenses/summary?month=${currentMonth}&year=${currentYear}`)
      ]);

      if (expensesResponse.data.success) {
        setExpenses(expensesResponse.data.expenses || []);
      }

      if (summaryResponse.data.success) {
        setSummary(summaryResponse.data.summary || {
          totalExpenses: 0,
          expensesByCategory: {},
          monthlyTotal: 0
        });
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast.error('Failed to load expenses data');
      // Set default values on error
      setExpenses([]);
      setSummary({
        totalExpenses: 0,
        expensesByCategory: {},
        monthlyTotal: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId, expenseDescription) => {
    setConfirm({
      open: true,
      title: 'Delete Expense',
      message: `Are you sure you want to delete this expense "${expenseDescription}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const response = await api.delete(`/expenses/${expenseId}`);
          if (response.data.success) {
            toast.success('Expense deleted successfully');
            loadMonthlyExpenses();
          }
        } catch (error) {
          console.error('Error deleting expense:', error);
          toast.error('Failed to delete expense');
        } finally {
          setConfirm(prev => ({ ...prev, open: false }));
        }
      }
    });
  };

  const handleGenerateReport = async () => {
    try {
      const response = await api.get(`/expenses/report?month=${currentMonth}&year=${currentYear}`);
      if (response.data.success) {
        const report = response.data.report;
        const reportData = `
Expense Report - ${getMonthName(currentMonth)} ${currentYear}
${'='.repeat(50)}

Total Monthly Expenses: ₹${report.totalExpenses?.toLocaleString() || '0'}

Expenses by Category:
${Object.entries(report.expensesByCategory || {}).map(([category, amount]) => 
  `${getCategoryLabel(category)}: ₹${amount.toLocaleString()}`
).join('\n')}

Detailed Expenses:
${expenses.map(expense => 
  `${new Date(expense.expense_date).toLocaleDateString()} - ${getCategoryLabel(expense.category)}: ₹${expense.amount} (${expense.description})`
).join('\n')}

Report generated on: ${new Date().toLocaleString()}
        `;

        const blob = new Blob([reportData], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses-report-${currentMonth}-${currentYear}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast.success('Expense report downloaded successfully');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate expense report');
    }
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const getCategoryLabel = (categoryValue) => {
    const category = expenseCategories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  const getCategoryIcon = (categoryValue) => {
    const category = expenseCategories.find(cat => cat.value === categoryValue);
    return category ? category.icon : '💼';
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString()}`;
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Expense Management
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track and manage school expenses
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              onClick={() => setShowAddExpenseModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-sm font-medium w-full sm:w-auto"
            >
              <PlusIcon className="h-4 w-4" />
              Add Expense
            </Button>
            <Button 
              onClick={handleGenerateReport}
              variant="outline"
              className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-sm font-medium w-full sm:w-auto"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Month/Year Selection */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
            </div>
            <div className="flex gap-3 flex-1">
              <div className="flex-1">
                <Select
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  options={Array.from({ length: 12 }, (_, i) => ({
                    value: i + 1,
                    label: getMonthName(i + 1)
                  }))}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <Select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  options={Array.from({ length: 5 }, (_, i) => ({
                    value: new Date().getFullYear() - 2 + i,
                    label: new Date().getFullYear() - 2 + i
                  }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg flex-shrink-0">
                <BanknotesIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  Total Expenses
                </p>
                <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(summary.totalExpenses)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                <ReceiptPercentIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  Categories
                </p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Object.keys(summary.expensesByCategory || {}).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
                <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  Total Entries
                </p>
                <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                  {expenses.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Expenses List */}
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {getMonthName(currentMonth)} {currentYear} Expenses
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <ReceiptPercentIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No expenses recorded
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start tracking expenses by adding your first entry
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {expenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="text-xl sm:text-2xl flex-shrink-0 pt-1 sm:pt-0">
                          {getCategoryIcon(expense.category)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                            {expense.description}
                          </h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="truncate">{getCategoryLabel(expense.category)}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className="text-base sm:text-lg font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(expense.amount)}
                        </span>
                        <Button
                          onClick={() => handleDeleteExpense(expense.id, expense.description)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 px-3 py-2"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Card>

        {/* Add Expense Modal */}
        <AddExpenseModal
          isOpen={showAddExpenseModal}
          onClose={() => setShowAddExpenseModal(false)}
          categories={expenseCategories}
          onAddExpense={loadMonthlyExpenses}
          month={currentMonth}
          year={currentYear}
        />

        <ConfirmModal
          isOpen={confirm.open}
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(prev => ({ ...prev, open: false }))}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
    </>
  );
};

// Add Expense Modal Component
const AddExpenseModal = ({ isOpen, onClose, categories, onAddExpense, month, year }) => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    expense_date: formatDateForAPI(new Date())
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.description || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/expenses', {
        ...formData,
        amount: parseFloat(formData.amount)
      });

      if (response.data.success) {
        toast.success('Expense added successfully');
        onAddExpense();
        setFormData({
          category: '',
          description: '',
          amount: '',
          expense_date: formatDateForAPI(new Date())
        });
        onClose();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: '', label: 'Select a category...' },
    ...categories.map(cat => ({ value: cat.value, label: `${cat.icon} ${cat.label}` }))
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 text-center sm:text-left">
              Add New Expense
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  options={categoryOptions}
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter expense description"
                  required
                  className="w-full h-12 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount *
                </label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                  className="w-full h-12 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  required
                  className="w-full h-12 text-base"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="button" 
                  onClick={onClose} 
                  variant="outline" 
                  className="w-full sm:flex-1 h-12 text-base font-medium"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="w-full sm:flex-1 h-12 text-base font-medium" 
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Expense'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExpenseManagement;