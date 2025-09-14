const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  getMonthlyExpenses,
  getExpenseSummary,
  addExpense,
  deleteExpense,
  generateExpenseReport,
  updateExpense
} = require('../controllers/expensesController');

const router = express.Router();

// Get monthly expenses
router.get('/monthly', /* authenticate, authorize('admin'), */ getMonthlyExpenses);

// Get expense summary
router.get('/summary', /* authenticate, authorize('admin'), */ getExpenseSummary);

// Generate expense report
router.get('/report', /* authenticate, authorize('admin'), */ generateExpenseReport);

// Add new expense
router.post('/', /* authenticate, authorize('admin'), */ addExpense);

// Update expense
router.put('/:expenseId', /* authenticate, authorize('admin'), */ updateExpense);

// Delete expense
router.delete('/:expenseId', /* authenticate, authorize('admin'), */ deleteExpense);

module.exports = router;