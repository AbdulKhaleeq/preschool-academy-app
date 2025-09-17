const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getStudents, getStudentsByParent, getStudentsByTeacher, addStudent, updateStudent, deleteStudent } = require('../controllers/studentsController');

const router = express.Router();

router.get('/', authenticate, getStudents);
router.get('/parent/:phone', authenticate, authorize('parent', 'admin', 'teacher'), getStudentsByParent);
router.get('/teacher/:teacherName', authenticate, authorize('teacher', 'admin'), getStudentsByTeacher);
router.post('/', authenticate, authorize('admin'), addStudent);
router.put('/:id', authenticate, authorize('admin'), updateStudent);
router.delete('/:id', authenticate, authorize('admin'), deleteStudent);

module.exports = router;


