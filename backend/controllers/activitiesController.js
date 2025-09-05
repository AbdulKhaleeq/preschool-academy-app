const { pool } = require('../config/db');

const listActivities = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activities ORDER BY scheduled_at ASC NULLS LAST, created_at DESC');
    return res.json({ success: true, activities: result.rows });
  } catch (error) {
    console.error('Error listing activities:', error);
    return res.status(500).json({ success: false, message: 'Error fetching activities' });
  }
};

const createActivity = async (req, res) => {
  try {
    const { title, description, scheduled_at, created_by_name } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title required' });
    const result = await pool.query(
      `INSERT INTO activities (title, description, scheduled_at, created_by_name) VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description || null, scheduled_at || null, created_by_name || null]
    );
    return res.json({ success: true, activity: result.rows[0] });
  } catch (error) {
    console.error('Error creating activity:', error);
    return res.status(500).json({ success: false, message: 'Error creating activity' });
  }
};

module.exports = { listActivities, createActivity };


