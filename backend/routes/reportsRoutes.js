const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getStudentsByProgram } = require('../controllers/reportsController');

const router = express.Router();

router.get('/students-by-program', authenticate, authorize('admin'), getStudentsByProgram);

module.exports = router;



