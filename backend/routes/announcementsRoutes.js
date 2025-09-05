const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { listAnnouncements, createAnnouncement } = require('../controllers/announcementsController');

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'teacher', 'parent'), listAnnouncements);
router.post('/', authenticate, authorize('admin', 'teacher'), createAnnouncement);

module.exports = router;


