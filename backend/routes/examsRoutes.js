const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { addOrUpdateResult, getResultsForStudent, updateResult, deleteResult, upsertFeedback, getFeedback } = require('../controllers/examsController');

const router = express.Router();

// Place specific routes BEFORE param routes to avoid collisions
router.put('/feedback', authenticate, authorize('teacher', 'admin'), upsertFeedback);
router.get('/feedback/:studentId/:examType', authenticate, authorize('teacher', 'admin', 'parent'), getFeedback);

router.post('/', authenticate, authorize('teacher', 'admin'), addOrUpdateResult);
router.get('/:studentId', authenticate, authorize('teacher', 'admin', 'parent'), getResultsForStudent);
router.put('/:id', authenticate, authorize('teacher', 'admin'), updateResult);
router.delete('/:id', authenticate, authorize('teacher', 'admin'), deleteResult);

module.exports = router;


