const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { listActivities, createActivity, updateActivityStatus, getTeacherStudents, deleteActivity } = require('../controllers/activitiesController');

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'teacher', 'parent'), listActivities);
router.post('/', authenticate, authorize('admin', 'teacher'), createActivity);
router.patch('/:id', authenticate, authorize('admin', 'teacher'), updateActivityStatus);
router.delete('/:id', authenticate, authorize('admin', 'teacher'), deleteActivity);
router.get('/teacher-students', authenticate, authorize('teacher'), getTeacherStudents);

module.exports = router;



