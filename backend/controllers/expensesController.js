const { pool } = require('../config/db');

// Get expenses for a specific month/year
const getMonthlyExpenses = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();


    const result = await pool.query(`
      SELECT 
        id,
        category,
        description,
        amount,
        expense_date,
        created_at
      FROM expenses 
      WHERE EXTRACT(MONTH FROM expense_date) = $1 
        AND EXTRACT(YEAR FROM expense_date) = $2
      ORDER BY expense_date DESC, created_at DESC
    `, [currentMonth, currentYear]);

    const expenses = result.rows;

    return res.json({ 
      success: true, 
      expenses, 
      month: currentMonth, 
      year: currentYear 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error getting monthly expenses' 
    });
  }
};

// Get expense summary for a specific month/year
const getExpenseSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();


    // Get total expenses for the month
    const totalResult = await pool.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_expenses,
        COUNT(*) as expense_count
      FROM expenses 
      WHERE EXTRACT(MONTH FROM expense_date) = $1 
        AND EXTRACT(YEAR FROM expense_date) = $2
    `, [currentMonth, currentYear]);

    // Get expenses by category
    const categoryResult = await pool.query(`
      SELECT 
        category,
        COALESCE(SUM(amount), 0) as category_total,
        COUNT(*) as category_count
      FROM expenses 
      WHERE EXTRACT(MONTH FROM expense_date) = $1 
        AND EXTRACT(YEAR FROM expense_date) = $2
      GROUP BY category
      ORDER BY category_total DESC
    `, [currentMonth, currentYear]);

    const expensesByCategory = {};
    categoryResult.rows.forEach(row => {
      expensesByCategory[row.category] = parseFloat(row.category_total);
    });

    const summary = {
      totalExpenses: parseFloat(totalResult.rows[0].total_expenses),
      expenseCount: parseInt(totalResult.rows[0].expense_count),
      expensesByCategory,
      monthlyTotal: parseFloat(totalResult.rows[0].total_expenses)
    };

    return res.json({ 
      success: true, 
      summary, 
      month: currentMonth, 
      year: currentYear 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error getting expense summary' 
    });
  }
};

// Add a new expense
const addExpense = async (req, res) => {
  try {
    const { category, description, amount, expense_date } = req.body;

    if (!category || !description || !amount || !expense_date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category, description, amount, and expense date are required' 
      });
    }

    console.log(`💰 Adding new expense: ${description} - ₹${amount}`);

    const result = await pool.query(`
      INSERT INTO expenses (category, description, amount, expense_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [category, description, parseFloat(amount), expense_date]);

    const expense = result.rows[0];

    return res.json({ 
      success: true, 
      expense,
      message: 'Expense added successfully' 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error adding expense' 
    });
  }
};

// Delete an expense
const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    console.log(`🗑️ Deleting expense with ID: ${expenseId}`);

    const result = await pool.query(`
      DELETE FROM expenses 
      WHERE id = $1 
      RETURNING *
    `, [expenseId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    return res.json({ 
      success: true, 
      message: 'Expense deleted successfully' 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error deleting expense' 
    });
  }
};

// Generate expense report
const generateExpenseReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    console.log(`📋 Generating expense report for ${currentMonth}/${currentYear}`);

    // Get detailed expenses
    const expensesResult = await pool.query(`
      SELECT 
        id,
        category,
        description,
        amount,
        expense_date,
        created_at
      FROM expenses 
      WHERE EXTRACT(MONTH FROM expense_date) = $1 
        AND EXTRACT(YEAR FROM expense_date) = $2
      ORDER BY expense_date DESC, created_at DESC
    `, [currentMonth, currentYear]);

    // Get summary data
    const summaryResult = await pool.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_expenses,
        COUNT(*) as expense_count
      FROM expenses 
      WHERE EXTRACT(MONTH FROM expense_date) = $1 
        AND EXTRACT(YEAR FROM expense_date) = $2
    `, [currentMonth, currentYear]);

    // Get expenses by category
    const categoryResult = await pool.query(`
      SELECT 
        category,
        COALESCE(SUM(amount), 0) as category_total,
        COUNT(*) as category_count
      FROM expenses 
      WHERE EXTRACT(MONTH FROM expense_date) = $1 
        AND EXTRACT(YEAR FROM expense_date) = $2
      GROUP BY category
      ORDER BY category_total DESC
    `, [currentMonth, currentYear]);

    const expensesByCategory = {};
    categoryResult.rows.forEach(row => {
      expensesByCategory[row.category] = parseFloat(row.category_total);
    });

    const report = {
      expenses: expensesResult.rows,
      totalExpenses: parseFloat(summaryResult.rows[0].total_expenses),
      expenseCount: parseInt(summaryResult.rows[0].expense_count),
      expensesByCategory,
      month: currentMonth,
      year: currentYear,
      generatedAt: new Date()
    };

    return res.json({ 
      success: true, 
      report 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error generating expense report' 
    });
  }
};

// Update an existing expense
const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { category, description, amount, expense_date } = req.body;

    console.log(`✏️ Updating expense with ID: ${expenseId}`);

    const result = await pool.query(`
      UPDATE expenses 
      SET 
        category = COALESCE($1, category),
        description = COALESCE($2, description),
        amount = COALESCE($3, amount),
        expense_date = COALESCE($4, expense_date),
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `, [category, description, amount ? parseFloat(amount) : null, expense_date, expenseId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    const expense = result.rows[0];

    return res.json({ 
      success: true, 
      expense,
      message: 'Expense updated successfully' 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error updating expense' 
    });
  }
};

module.exports = {
  getMonthlyExpenses,
  getExpenseSummary,
  addExpense,
  deleteExpense,
  generateExpenseReport,
  updateExpense
};