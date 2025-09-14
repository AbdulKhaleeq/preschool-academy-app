import React, { useState, useEffect } from 'react';
import api from '../api';
import { Card, Button, Input, Select } from './ui';
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

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await api.delete(`/expenses/${expenseId}`);
      if (response.data.success) {
        toast.success('Expense deleted successfully');
        loadMonthlyExpenses();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Track and manage school expenses</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowAddExpenseModal(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Add Expense
          </Button>
          <Button 
            onClick={handleGenerateReport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Month/Year Selection */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <Select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            options={Array.from({ length: 12 }, (_, i) => ({
              value: i + 1,
              label: getMonthName(i + 1)
            }))}
          />
          <Select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            options={Array.from({ length: 5 }, (_, i) => ({
              value: new Date().getFullYear() - 2 + i,
              label: new Date().getFullYear() - 2 + i
            }))}
          />
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(summary.totalExpenses)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <ReceiptPercentIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Object.keys(summary.expensesByCategory || {}).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Entries</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {expenses.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Expenses List */}
      <Card className="p-6">
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
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getCategoryIcon(expense.category)}</div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {expense.description}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{getCategoryLabel(expense.category)}</span>
                          <span>•</span>
                          <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(expense.amount)}
                      </span>
                      <Button
                        onClick={() => handleDeleteExpense(expense.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
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
    </div>
  );
};

// Add Expense Modal Component
const AddExpenseModal = ({ isOpen, onClose, categories, onAddExpense, month, year }) => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0]
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
          expense_date: new Date().toISOString().split('T')[0]
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
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={onClose} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
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