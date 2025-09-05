const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { upsertDailyReport, getDailyReportsForStudent } = require('../controllers/dailyReportsController');

const router = express.Router();

router.post('/', authenticate, authorize('teacher', 'admin'), upsertDailyReport);
router.get('/:studentId', authenticate, authorize('teacher', 'admin', 'parent'), getDailyReportsForStudent);

module.exports = router;


