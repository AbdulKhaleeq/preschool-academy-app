const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { sendMessage, listMessages } = require('../controllers/messagesController');

const router = express.Router();

router.post('/', authenticate, authorize('teacher', 'parent'), sendMessage);
router.get('/', authenticate, authorize('teacher', 'parent'), listMessages);

module.exports = router;



