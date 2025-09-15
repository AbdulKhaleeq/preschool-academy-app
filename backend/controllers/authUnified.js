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

// In-memory OTP store for demo/dev. Replace with Redis in production.
const phoneToOtp = new Map();

const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body; // No longer expecting role from frontend
    if (!phone) return res.status(400).json({ success: false, message: 'Phone is required' });

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
    phoneToOtp.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
    
    return res.json({ success: true, message: 'OTP generated', otp });
  } catch (error) {
    console.error('Error in requestOtp:', error);
    return res.status(500).json({ success: false, message: 'Failed to request OTP' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    
    const record = phoneToOtp.get(phone);
    if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

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
    
    // Clean up OTP
    phoneToOtp.delete(phone);
    
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

module.exports = { requestOtp, verifyOtp };



