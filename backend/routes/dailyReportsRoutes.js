const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { upsertDailyReport, getDailyReportsForStudent, getDailyReportByDate, getReportDatesWithNotes } = require('../controllers/dailyReportsController');

const router = express.Router();

router.post('/', authenticate, authorize('teacher', 'admin'), upsertDailyReport);
router.get('/:studentId', authenticate, authorize('teacher', 'admin', 'parent'), getDailyReportsForStudent);
router.get('/:studentId/by-date/:date', authenticate, authorize('teacher', 'admin', 'parent'), getDailyReportByDate);
router.get('/:studentId/dates-with-notes', authenticate, authorize('teacher', 'admin', 'parent'), getReportDatesWithNotes);

module.exports = router;


