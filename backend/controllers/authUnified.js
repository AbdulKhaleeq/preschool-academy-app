const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Get admin phones and normalize them (remove country code prefix for comparison)
const ADMIN_PHONES_RAW = (process.env.ADMIN_PHONES || '9876543210,1234567890')
  .split(',')
  .map(p => p.trim());

// Helper function to normalize phone number for comparison
const normalizePhone = (phone) => {
  // Remove +91 prefix if present, keep just the 10-digit number
  return phone.replace(/^\+91/, '').replace(/^\+/, '').trim();
};

// Helper function to check if phone is admin
const isAdminPhone = (phone) => {
  const normalizedPhone = normalizePhone(phone);
  return ADMIN_PHONES_RAW.includes(normalizedPhone);
};

// In-memory stores for demo/dev. Replace with Redis in production.
const phoneToOtp = new Map();
const attemptTracker = new Map(); // Track failed attempts per phone
const requestTracker = new Map(); // Track OTP request frequency

// Rate limiting constants
const MAX_ATTEMPTS = 3;
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 5; // Max OTP requests
const REQUEST_WINDOW = 10 * 60 * 1000; // 10 minutes
const OTP_EXPIRY = 25 * 1000; // 25 seconds (shorter for security)

// Precheck endpoint: validate that the phone belongs to an admin or an existing active user
// POST /auth/precheck-phone { phone }
const precheckPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone is required' });

    const normalized = normalizePhone(phone);

    if (isAdminPhone(normalized)) {
      return res.json({ success: true, role: 'admin' });
    }

    const result = await pool.query('SELECT role, is_active FROM users WHERE phone_number = $1 LIMIT 1', [normalized]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Mobile number not registered. Please contact admin.' });
    }
    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, blocked: true, message: 'Your account has been blocked. Please contact admin.' });
    }
    return res.json({ success: true, role: user.role });
  } catch (err) {
    console.error('Error in precheckPhone:', err);
    return res.status(500).json({ success: false, message: 'Failed to validate phone' });
  }
};

const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body; // No longer expecting role from frontend
    if (!phone) return res.status(400).json({ success: false, message: 'Phone is required' });

    // Check request rate limiting
    const now = Date.now();
    const phoneRequests = requestTracker.get(phone) || [];
    
    // Clean old requests outside the window
    const recentRequests = phoneRequests.filter(time => now - time < REQUEST_WINDOW);
    
    if (recentRequests.length >= MAX_REQUESTS) {
      return res.status(429).json({ 
        success: false, 
        message: 'Too many OTP requests. Please wait 10 minutes and try again.' 
      });
    }

    // Check if phone number exists in database or is admin
    let isValidUser = false;
    let userRole = null;
    let isActive = true;

    // First check if it's an admin phone
    if (isAdminPhone(phone)) {
      isValidUser = true;
      userRole = 'admin';
    } else {
      // Check if phone exists in users table
      const userResult = await pool.query('SELECT role, is_active FROM users WHERE phone_number = $1 LIMIT 1', [phone]);
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        isValidUser = true;
        userRole = user.role;
        isActive = !!user.is_active;
      }
    }

    // If phone number is not found anywhere, reject with meaningful message
    if (!isValidUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mobile number not registered. Please contact admin.' 
      });
    }

    // Check if user is blocked (only for non-admin users)
    if (userRole !== 'admin' && !isActive) {
      return res.status(403).json({ 
        success: false, 
        blocked: true, 
        message: 'Your account has been blocked. Please contact admin.' 
      });
    }

    // Generate and store OTP
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    phoneToOtp.set(phone, { otp, expiresAt: Date.now() + OTP_EXPIRY });
    
    // Track this request
    recentRequests.push(now);
    requestTracker.set(phone, recentRequests);
    
    return res.json({ 
      success: true, 
      message: 'OTP generated', 
      otp,
      expiresIn: OTP_EXPIRY // Send expiry time to frontend for countdown
    });
  } catch (error) {
    console.error('Error in requestOtp:', error);
    return res.status(500).json({ success: false, message: 'Failed to request OTP' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    
    // Check attempt rate limiting
    const now = Date.now();
    const phoneAttempts = attemptTracker.get(phone) || [];
    
    // Clean old attempts outside the window
    const recentAttempts = phoneAttempts.filter(time => now - time < ATTEMPT_WINDOW);
    
    if (recentAttempts.length >= MAX_ATTEMPTS) {
      return res.status(429).json({ 
        success: false, 
        message: `Too many failed attempts. Please wait 5 minutes and try again.` 
      });
    }
    
    const record = phoneToOtp.get(phone);
    if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
      // Track failed attempt
      recentAttempts.push(now);
      attemptTracker.set(phone, recentAttempts);
      
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Success - clear tracking data
    phoneToOtp.delete(phone);
    attemptTracker.delete(phone);
    requestTracker.delete(phone);

    // Determine role and user details
    let role = null;
    let isActive = true;
    let name = '';
    let userId = null;

    // Check if it's an admin phone first
    if (isAdminPhone(phone)) {
      role = 'admin';
      name = 'Administrator';
      userId = 'admin'; // Special ID for admin
    } else {
      // Get user details from database
      const userResult = await pool.query('SELECT id, name, role, is_active FROM users WHERE phone_number = $1 LIMIT 1', [phone]);
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        role = user.role;
        isActive = !!user.is_active;
        name = user.name || '';
        userId = user.id;
      } else {
        // This shouldn't happen if requestOtp worked correctly, but just in case
        return res.status(404).json({ 
          success: false, 
          message: 'User not found. Please contact admin.' 
        });
      }
    }

    // Check if user is blocked (admins can't be blocked)
    if (role !== 'admin' && !isActive) {
      return res.status(403).json({ 
        success: false, 
        blocked: true, 
        message: 'Your account has been blocked. Please contact admin.' 
      });
    }

    // Generate JWT token
    const token = jwt.sign({ phone, role, userId, name }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    
    return res.json({ 
      success: true, 
      token, 
      user: { phone, role, name, id: userId } 
    });
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
};

module.exports = { requestOtp, verifyOtp, precheckPhone };




