const { pool } = require('../config/db');

const sendMessage = async (req, res) => {
  try {
    const { student_id, teacher_name, parent_phone, from_role, content } = req.body;
    if (!from_role || !content) return res.status(400).json({ success: false, message: 'Missing fields' });
    const result = await pool.query(
      `INSERT INTO messages (student_id, teacher_name, parent_phone, from_role, content) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [student_id || null, teacher_name || null, parent_phone || null, from_role, content]
    );
    return res.json({ success: true, message: result.rows[0] });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ success: false, message: 'Error sending message' });
  }
};

const getMessagesForTeacher = async (req, res) => {
  try {
    const { teacherName } = req.params;
    const result = await pool.query('SELECT * FROM messages WHERE teacher_name = $1 ORDER BY created_at DESC', [teacherName]);
    return res.json({ success: true, messages: result.rows });
  } catch (error) {
    console.error('Error fetching teacher messages:', error);
    return res.status(500).json({ success: false, message: 'Error fetching messages' });
  }
};

const getMessagesForParent = async (req, res) => {
  try {
    const { parentPhone } = req.params;
    const result = await pool.query('SELECT * FROM messages WHERE parent_phone = $1 ORDER BY created_at DESC', [parentPhone]);
    return res.json({ success: true, messages: result.rows });
  } catch (error) {
    console.error('Error fetching parent messages:', error);
    return res.status(500).json({ success: false, message: 'Error fetching messages' });
  }
};

module.exports = { sendMessage, getMessagesForTeacher, getMessagesForParent };


