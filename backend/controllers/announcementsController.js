const { pool } = require('../config/db');

const listAnnouncements = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
    return res.json({ success: true, announcements: result.rows });
  } catch (error) {
    console.error('Error listing announcements:', error);
    return res.status(500).json({ success: false, message: 'Error fetching announcements' });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, content, created_by_role, created_by_name, audience } = req.body;
    if (!title || !content || !created_by_role) return res.status(400).json({ success: false, message: 'Missing fields' });
    const result = await pool.query(
      `INSERT INTO announcements (title, content, created_by_role, created_by_name, audience) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, content, created_by_role, created_by_name || null, audience || 'all']
    );
    return res.json({ success: true, announcement: result.rows[0] });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return res.status(500).json({ success: false, message: 'Error creating announcement' });
  }
};

module.exports = { listAnnouncements, createAnnouncement };


