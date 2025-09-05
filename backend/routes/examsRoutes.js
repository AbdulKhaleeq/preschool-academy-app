const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { addOrUpdateResult, getResultsForStudent, updateResult, deleteResult } = require('../controllers/examsController');

const router = express.Router();

router.post('/', authenticate, authorize('teacher', 'admin'), addOrUpdateResult);
router.get('/:studentId', authenticate, authorize('teacher', 'admin', 'parent'), getResultsForStudent);
router.put('/:id', authenticate, authorize('teacher', 'admin'), updateResult);
router.delete('/:id', authenticate, authorize('teacher', 'admin'), deleteResult);

module.exports = router;


