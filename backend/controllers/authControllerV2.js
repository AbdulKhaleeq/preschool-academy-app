// const { pool } = require('../config/db');

// const ADMIN_WHITELIST = (process.env.ADMIN_PHONES || '+919876543210,+911234567890')
//   .split(',')
//   .map(p => p.trim());

// // Shared in-memory OTP for demo
// const phoneToOtpV2 = new Map();

// const requestOtpV2 = async (req, res) => {
//   try {
//     const { phone, role } = req.body;
//     if (!phone) return res.status(400).json({ success: false, message: 'Phone is required' });
//     if (role) {
//       if (role === 'admin') {
//         if (!ADMIN_WHITELIST.includes(phone)) {
//           return res.status(400).json({ success: false, message: 'Invalid role selected for this account' });
//         }
//       } else {
//         const row = await pool.query('SELECT role, is_active FROM users WHERE phone_number = $1 LIMIT 1', [phone]);
//         if (row.rows.length === 0 || row.rows[0].role !== role) {
//           return res.status(400).json({ success: false, message: 'Invalid role selected for this account' });
//         }
//         if (!row.rows[0].is_active) {
//           return res.status(403).json({ success: false, blocked: true, message: 'You are Blocked.' });
//         }
//       }
//     }
//     const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
//     phoneToOtpV2.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
//     return res.json({ success: true, message: 'OTP generated', otp });
//   } catch (error) {
//     console.error('Error in requestOtpV2:', error);
//     return res.status(500).json({ success: false, message: 'Failed to request OTP' });
//   }
// };

// module.exports = { requestOtpV2, phoneToOtpV2 };



