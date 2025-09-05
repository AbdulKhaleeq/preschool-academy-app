const express = require('express');
// Unified auth controller
const { requestOtp, verifyOtp } = require('../controllers/authUnified');

const router = express.Router();

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
// Unified: /request-otp already pre-validates role

module.exports = router;


