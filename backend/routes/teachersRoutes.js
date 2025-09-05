const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getTeachers, addTeacher, updateTeacher, deleteTeacher } = require('../controllers/teachersController');

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'teacher'), getTeachers);
router.post('/', authenticate, authorize('admin'), addTeacher);
router.put('/:id', authenticate, authorize('admin'), updateTeacher);
router.delete('/:id', authenticate, authorize('admin'), deleteTeacher);

module.exports = router;


