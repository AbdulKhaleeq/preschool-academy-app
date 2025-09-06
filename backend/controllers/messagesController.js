const { pool } = require('../config/db');

const sendMessage = async (req, res) => {
  try {
    const { receiver_id, receiver_group, message } = req.body;
    const senderId = req.user?.id;
    const role = req.user?.role;
    if (!senderId || !message) return res.status(400).json({ success: false, message: 'Missing sender or message' });

    if (role === 'teacher') {
      if (receiver_group === 'all_parents') {
        const result = await pool.query(
          `INSERT INTO messages (sender_id, receiver_group, message) VALUES ($1, 'all_parents', $2) RETURNING *`,
          [senderId, message]
        );
        return res.json({ success: true, message: result.rows[0] });
      }
      if (!receiver_id) return res.status(400).json({ success: false, message: 'receiver_id is required for direct messages' });
      const result = await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *`,
        [senderId, receiver_id, message]
      );
      return res.json({ success: true, message: result.rows[0] });
    }

    if (role === 'parent') {
      if (!receiver_id) return res.status(400).json({ success: false, message: 'receiver_id (teacher) is required' });
      const result = await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *`,
        [senderId, receiver_id, message]
      );
      return res.json({ success: true, message: result.rows[0] });
    }

    return res.status(403).json({ success: false, message: 'Forbidden' });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ success: false, message: 'Error sending message' });
  }
};

const listMessages = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (role === 'teacher') {
      const result = await pool.query(
        `SELECT m.*, u.name as sender_name FROM messages m
         LEFT JOIN users u ON u.id = m.sender_id
         WHERE m.receiver_group = 'all_parents' OR m.receiver_id = $1 OR m.sender_id = $1
         ORDER BY m.created_at DESC`,
        [userId]
      );
      return res.json({ success: true, messages: result.rows });
    }
    if (role === 'parent') {
      const result = await pool.query(
        `SELECT m.*, u.name as sender_name FROM messages m
         LEFT JOIN users u ON u.id = m.sender_id
         WHERE m.receiver_group = 'all_parents' OR m.receiver_id = $1 OR m.sender_id = $1
         ORDER BY m.created_at DESC`,
        [userId]
      );
      return res.json({ success: true, messages: result.rows });
    }
    return res.json({ success: true, messages: [] });
  } catch (error) {
    console.error('Error fetching messages:', error);
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

module.exports = { sendMessage, listMessages };



