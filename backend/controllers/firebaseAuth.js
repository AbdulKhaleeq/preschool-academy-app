const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { pool } = require('../config/db');

// Admin initialization with env variables (base64 service account or application default)
// Prefer GOOGLE_APPLICATION_CREDENTIALS if present; else support inline base64 JSON
if (!admin.apps.length) {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp();
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(json)),
    });
  } else {
    console.warn('Firebase Admin not fully configured. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_BASE64.');
  }
}

// Get admin phones and normalize
const ADMIN_PHONES_RAW = (process.env.ADMIN_PHONES || '9876543210,1234567890')
  .split(',')
  .map(p => p.trim());

const normalizePhone = (phone) => phone.replace(/^\+91/, '').replace(/^\+/, '').trim();

const isAdminPhone = (phone) => ADMIN_PHONES_RAW.includes(normalizePhone(phone));

// POST /auth/firebase-login { idToken, phone }
const firebaseLogin = async (req, res) => {
  try {
    const { idToken, phone } = req.body;
    if (!idToken || !phone) {
      return res.status(400).json({ success: false, message: 'idToken and phone are required' });
    }

    // Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const firebasePhone = decoded.phone_number; // E.164 like +919876543210
    if (!firebasePhone) {
      return res.status(400).json({ success: false, message: 'Phone number missing in Firebase token' });
    }

    // Ensure client-provided phone matches verified phone (last 10 digits)
    const clientLocal = normalizePhone(phone);
    const firebaseLocal = normalizePhone(firebasePhone);
    if (clientLocal !== firebaseLocal) {
      return res.status(400).json({ success: false, message: 'Phone mismatch' });
    }

    // Determine role and user details
    let role = null;
    let isActive = true;
    let name = '';
    let userId = null;

    if (isAdminPhone(clientLocal)) {
      role = 'admin';
      name = 'Administrator';
      userId = 'admin';
    } else {
      const result = await pool.query('SELECT id, name, role, is_active FROM users WHERE phone_number = $1 LIMIT 1', [clientLocal]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Mobile number not registered. Please contact admin.' });
      }
      const user = result.rows[0];
      role = user.role;
      isActive = !!user.is_active;
      name = user.name || '';
      userId = user.id;
    }

    if (role !== 'admin' && !isActive) {
      return res.status(403).json({ success: false, blocked: true, message: 'Your account has been blocked. Please contact admin.' });
    }

    const token = jwt.sign(
      { phone: clientLocal, role, userId, name },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );

    return res.json({ success: true, token, user: { phone: clientLocal, role, name, id: userId } });
  } catch (error) {
    console.error('firebaseLogin error:', error);
    return res.status(401).json({ success: false, message: 'Invalid Firebase token' });
  }
};

module.exports = { firebaseLogin };
