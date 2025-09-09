const { pool } = require('../config/db');

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Admin
const createAnnouncement = async (req, res) => {
  const { audience, message } = req.body;
  const adminId = req.user.id; // Assuming admin ID is available from protect middleware

  if (!audience || !message) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO announcements (admin_id, audience, message) VALUES ($1, $2, $3) RETURNING *;',
      [adminId, audience, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get announcements (filtered by role)
// @route   GET /api/announcements
// @access  Admin, Parents, Teachers
const getAnnouncements = async (req, res) => {
  const userRole = req.user.role;

  try {
    let query = 'SELECT * FROM announcements';
    let queryParams = [];

    if (userRole === 'parent') {
      query += ` WHERE audience = 'parents' OR audience = 'all'`;
    } else if (userRole === 'teacher') {
      query += ` WHERE audience = 'teachers' OR audience = 'all'`;
    }
    // Admin sees all, so no WHERE clause needed for admin
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createAnnouncement, getAnnouncements };



