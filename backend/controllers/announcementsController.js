const { pool } = require('../config/db');

const listAnnouncements = async (req, res) => {
  try {
    const role = req.user?.role;
    let where = '';
    const params = [];
    if (role === 'parent') {
      where = "WHERE audience IN ('parents','all')";
    } else if (role === 'teacher') {
      where = "WHERE audience IN ('teachers','all')";
    }
    const result = await pool.query(`SELECT * FROM announcements ${where} ORDER BY created_at DESC`, params);
    return res.json({ success: true, announcements: result.rows });
  } catch (error) {
    console.error('Error listing announcements:', error);
    return res.status(500).json({ success: false, message: 'Error fetching announcements' });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { message, audience } = req.body;
    if (!message || !audience) return res.status(400).json({ success: false, message: 'Missing fields' });
    if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    const adminId = req.user?.id || null;
    const result = await pool.query(
      `INSERT INTO announcements (admin_id, audience, message) VALUES ($1, $2, $3) RETURNING *`,
      [adminId, audience, message]
    );
    return res.json({ success: true, announcement: result.rows[0] });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return res.status(500).json({ success: false, message: 'Error creating announcement' });
  }
};

module.exports = { listAnnouncements, createAnnouncement };



