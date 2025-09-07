const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
    teacherSendToAllParents,
    teacherSendToParent,
    parentSendToTeacher,
    getMessages,
    getTeacherContacts,
    getParentContacts
} = require('../controllers/messagesController');

const router = express.Router();

// Teacher routes
router.post('/teacher/send-to-all-parents', authenticate, authorize('teacher'), teacherSendToAllParents);
router.post('/teacher/send-to-parent', authenticate, authorize('teacher'), teacherSendToParent);
router.get('/teacher/contacts', authenticate, authorize('teacher'), getTeacherContacts);

// Parent routes
router.post('/parent/send-to-teacher', authenticate, authorize('parent'), parentSendToTeacher);
router.get('/parent/contacts', authenticate, authorize('parent'), getParentContacts);

// Common message routes
router.get('/', authenticate, getMessages);

module.exports = router;
