const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const ADMIN_WHITELIST = (process.env.ADMIN_PHONES || '+919876543210,+911234567890')
  .split(',')
  .map(p => p.trim());

// In-memory OTP store for demo/dev. Replace with Redis in production.
const phoneToOtp = new Map();

const requestOtp = async (req, res) => {
  try {
    const { phone, role } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone is required' });

    // Pre-validate role prior to OTP
    if (role) {
      if (role === 'admin') {
        if (!ADMIN_WHITELIST.includes(phone)) {
          return res.status(400).json({ success: false, message: 'Invalid role selected for this account' });
        }
      } else {
        const row = await pool.query('SELECT role, is_active FROM users WHERE phone_number = $1 LIMIT 1', [phone]);
        if (row.rows.length === 0 || row.rows[0].role !== role) {
          return res.status(400).json({ success: false, message: 'Invalid role selected for this account' });
        }
        if (!row.rows[0].is_active) {
          return res.status(403).json({ success: false, blocked: true, message: 'You are Blocked.' });
        }
      }
    }

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

    // Determine role and status
    let role = 'parent';
    let isActive = true;
    let name = '';
    let userId = null;
    const userResult = await pool.query('SELECT id, name, role, is_active FROM users WHERE phone_number = $1 LIMIT 1', [phone]);
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      role = user.role || role;
      isActive = !!user.is_active;
      name = user.name || '';
      userId = user.id;
    }

    if (ADMIN_WHITELIST.includes(phone)) {
      role = 'admin';
    }

    if (!isActive) {
      return res.status(403).json({ success: false, blocked: true, message: 'You are Blocked.' });
    }

    const token = jwt.sign({ phone, role, userId, name }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    phoneToOtp.delete(phone);
    return res.json({ success: true, token, user: { phone, role, name, id: userId } });
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
};

module.exports = { requestOtp, verifyOtp };



