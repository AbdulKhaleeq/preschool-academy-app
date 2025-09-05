const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { listFeesForStudent, markFeeStatus } = require('../controllers/feesController');

const router = express.Router();

router.get('/:studentId', authenticate, authorize('admin', 'teacher', 'parent'), listFeesForStudent);
router.post('/:studentId', authenticate, authorize('admin', 'teacher'), markFeeStatus);

module.exports = router;


