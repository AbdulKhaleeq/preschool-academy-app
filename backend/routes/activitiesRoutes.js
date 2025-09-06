const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { listActivities, createActivity } = require('../controllers/activitiesController');

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'teacher', 'parent'), listActivities);
router.post('/', authenticate, authorize('admin', 'teacher'), createActivity);

module.exports = router;



