const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { sendMessage, getMessagesForTeacher, getMessagesForParent } = require('../controllers/messagesController');

const router = express.Router();

router.post('/', authenticate, authorize('teacher', 'parent', 'admin'), sendMessage);
router.get('/teacher/:teacherName', authenticate, authorize('teacher', 'admin'), getMessagesForTeacher);
router.get('/parent/:parentPhone', authenticate, authorize('parent', 'admin'), getMessagesForParent);

module.exports = router;


