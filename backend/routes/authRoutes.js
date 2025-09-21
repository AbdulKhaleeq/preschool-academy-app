const express = require('express');
// Unified auth controller
const { requestOtp, verifyOtp, precheckPhone } = require('../controllers/authUnified');
const { firebaseLogin } = require('../controllers/firebaseAuth');

const router = express.Router();

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/firebase-login', firebaseLogin);
router.post('/precheck-phone', precheckPhone);
// Unified: /request-otp already pre-validates role

module.exports = router;


