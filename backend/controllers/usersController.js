const { pool } = require('../config/db');

const getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return res.json({ success: true, users: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, phone_number, role, is_active } = req.body;
    if (!phone_number || !role) {
      return res.status(400).json({ success: false, message: 'Phone number and role are required' });
    }
    const result = await pool.query(
      `INSERT INTO users (name, phone_number, role, is_active, created_at)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [name || null, phone_number, role, is_active !== false]
    );
    return res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Phone number already exists' });
    }
    return res.status(500).json({ success: false, message: 'Error creating user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone_number, role, is_active } = req.body;
    if (!phone_number || !role) {
      return res.status(400).json({ success: false, message: 'Phone number and role are required' });
    }
    const result = await pool.query(
      `UPDATE users SET name = $1, phone_number = $2, role = $3, is_active = $4 WHERE id = $5 RETURNING *`,
      [name || null, phone_number, role, is_active, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Phone number already exists' });
    }
    return res.status(500).json({ success: false, message: 'Error updating user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting user' });
  }
};

const setUserActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const result = await pool.query('UPDATE users SET is_active = $1 WHERE id = $2 RETURNING *', [is_active, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating user status' });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser, setUserActiveStatus };


