const express = require('express');
const router = express.Router();
const { createAnnouncement, getAnnouncements } = require('../controllers/announcementsController');
const { authenticate, authorize } = require('../middleware/auth');

router.route('/').post(authenticate, authorize(['admin']), createAnnouncement).get(authenticate, getAnnouncements);

module.exports = router;



