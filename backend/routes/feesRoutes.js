const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  getMonthlyFees,
  markFeeStatus, 
  addStudentToFees,
  generateNewMonth,
  getAvailableStudents,
  generateReport,
  getParentDues
} = require('../controllers/feesController');

const router = express.Router();

// Get monthly fees overview
router.get('/monthly', /* authenticate, authorize('admin'), */ getMonthlyFees);

// Generate financial report
router.get('/report', /* authenticate, authorize('admin'), */ generateReport);

// Get students available to add to fees
router.get('/available-students', /* authenticate, authorize('admin'), */ getAvailableStudents);

// Generate fees for new month
router.post('/generate-month', /* authenticate, authorize('admin'), */ generateNewMonth);

// Mark fee as paid/unpaid
router.post('/:studentId/status', /* authenticate, authorize('admin'), */ markFeeStatus);

// Add student to fee tracking
router.post('/:studentId/add', /* authenticate, authorize('admin'), */ addStudentToFees);

// Get pending dues for a parent
router.get('/parent/:parentId/dues', /* authenticate, */ getParentDues);

module.exports = router;



