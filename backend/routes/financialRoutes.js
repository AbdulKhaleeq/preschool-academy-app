const express = require('express');
const router = express.Router();
const { getFinancialSummary, downloadFinancialReport } = require('../controllers/financialSummaryController');
const { authenticate } = require('../middleware/auth');

// GET /api/financial/summary - Get financial summary for current month
router.get('/summary', authenticate, getFinancialSummary);

// GET /api/financial/report - Download PDF financial report
router.get('/report', authenticate, downloadFinancialReport);

module.exports = router;