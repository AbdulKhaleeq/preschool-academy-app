const { pool } = require('../config/db');
const PDFDocument = require('pdfkit');

// Get financial summary for specified month/year
const getFinancialSummary = async (req, res) => {
  try {
    // Get month/year from query params, default to current month/year
    const currentDate = new Date();
    const month = parseInt(req.query.month) || (currentDate.getMonth() + 1);
    const year = parseInt(req.query.year) || currentDate.getFullYear();

    // Get monthly collections (paid fees)
    const collectionsResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as monthly_collections
       FROM fees 
       WHERE month = $1 AND year = $2 AND is_paid = true`,
      [month, year]
    );

    // Get pending fees (unpaid fees)
    const pendingResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as pending_fees
       FROM fees 
       WHERE month = $1 AND year = $2 AND is_paid = false`,
      [month, year]
    );

    // Get monthly expenses
    const expensesResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as monthly_expenses
       FROM expenses 
       WHERE EXTRACT(MONTH FROM expense_date) = $1 
       AND EXTRACT(YEAR FROM expense_date) = $2`,
      [month, year]
    );

    const monthlyCollections = parseFloat(collectionsResult.rows[0].monthly_collections);
    const pendingFees = parseFloat(pendingResult.rows[0].pending_fees);
    const monthlyExpenses = parseFloat(expensesResult.rows[0].monthly_expenses);
    const netProfit = monthlyCollections - monthlyExpenses;

    const summary = {
      monthlyCollections,
      pendingFees,
      monthlyExpenses,
      netProfit,
      month,
      year
    };

    res.status(200).json({
      success: true,
      summary
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting financial summary'
    });
  }
};

// Generate and download PDF report
const downloadFinancialReport = async (req, res) => {
  try {
    // Get month/year from query params, default to current month/year
    const currentDate = new Date();
    const month = parseInt(req.query.month) || (currentDate.getMonth() + 1);
    const year = parseInt(req.query.year) || currentDate.getFullYear();

    // Get the same financial data as summary
    const collectionsResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as monthly_collections
       FROM fees 
       WHERE month = $1 AND year = $2 AND is_paid = true`,
      [month, year]
    );

    const pendingResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as pending_fees
       FROM fees 
       WHERE month = $1 AND year = $2 AND is_paid = false`,
      [month, year]
    );

    const expensesResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as monthly_expenses
       FROM expenses 
       WHERE EXTRACT(MONTH FROM expense_date) = $1 
       AND EXTRACT(YEAR FROM expense_date) = $2`,
      [month, year]
    );

    // Get detailed expenses for the report
    const expenseDetailsResult = await pool.query(
      `SELECT category, description, amount, expense_date
       FROM expenses 
       WHERE EXTRACT(MONTH FROM expense_date) = $1 
       AND EXTRACT(YEAR FROM expense_date) = $2
       ORDER BY expense_date DESC`,
      [month, year]
    );

    const monthlyCollections = parseFloat(collectionsResult.rows[0].monthly_collections);
    const pendingFees = parseFloat(pendingResult.rows[0].pending_fees);
    const monthlyExpenses = parseFloat(expensesResult.rows[0].monthly_expenses);
    const netProfit = monthlyCollections - monthlyExpenses;

    // Month names for display
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Create PDF document
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=financial-report-${monthNames[month-1]}-${year}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Add Wellington Kids header
    doc.fontSize(24).fillColor('#2563eb').text('Wellington Kids', 50, 30);
    doc.fontSize(20).fillColor('#000000').text('Financial Report', 50, 65);
    doc.fontSize(16).text(`${monthNames[month-1]} ${year}`, 50, 95);
    
    // Add a line
    doc.moveTo(50, 125).lineTo(550, 125).stroke();
    
    // Summary section
    doc.fontSize(14).text('Financial Summary', 50, 145);
    doc.fontSize(12);
    doc.text(`Monthly Collections: ${monthlyCollections.toFixed(2)}`, 70, 175);
    doc.text(`Pending Fees: ${pendingFees.toFixed(2)}`, 70, 195);
    doc.text(`Monthly Expenses: ${monthlyExpenses.toFixed(2)}`, 70, 215);
    doc.text(`Net Profit: ${netProfit.toFixed(2)}`, 70, 235);
    
    // Expenses breakdown
    if (expenseDetailsResult.rows.length > 0) {
      doc.fontSize(14).text('Expense Details', 50, 275);
      doc.fontSize(10);
      
      let yPosition = 305;
      expenseDetailsResult.rows.forEach((expense, index) => {
        // Check if we need a new page (leave space for footer)
        if (yPosition > 720) {
          doc.addPage();
          yPosition = 50;
        }
        
        const date = new Date(expense.expense_date).toLocaleDateString();
        doc.text(`${expense.category} - ${expense.description}`, 70, yPosition);
        doc.text(`${parseFloat(expense.amount).toFixed(2)} (${date})`, 350, yPosition);
        yPosition += 20;
      });
    }
    
    // Footer - add only on the last page with content
    const currentPage = doc.page;
    doc.fontSize(8).text(`Generated on ${new Date().toLocaleDateString()}`, 50, currentPage.height - 50);
    
    // Finalize PDF
    doc.end();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating PDF report'
    });
  }
};

module.exports = {
  getFinancialSummary,
  downloadFinancialReport
};