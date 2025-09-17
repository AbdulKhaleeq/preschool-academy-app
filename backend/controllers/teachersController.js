const { pool } = require('../config/db');

const getTeachers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teachers ORDER BY name');
    return res.json({ success: true, teachers: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching teachers' });
  }
};

// Get teachers from users table (for student assignment dropdown)
const getTeacherUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, phone_number FROM users WHERE role = $1 AND is_active = true ORDER BY name',
      ['teacher']
    );
    return res.json({ success: true, teachers: result.rows });
  } catch (error) {
    console.error('Error fetching teacher users:', error);
    return res.status(500).json({ success: false, message: 'Error fetching teachers' });
  }
};

const addTeacher = async (req, res) => {
  try {
    const { name, phone_number, email, class_name, subject, experience_years, qualification } = req.body;
    if (!name || !phone_number) {
      return res.status(400).json({ success: false, message: 'Name and phone number are required' });
    }
    const result = await pool.query(
      `INSERT INTO teachers (name, phone_number, email, class_name, subject, experience_years, qualification, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
      [name, phone_number, email || null, class_name || null, subject || null, experience_years || null, qualification || null]
    );
    return res.json({ success: true, teacher: result.rows[0], message: 'Teacher added successfully' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Phone number already exists' });
    }
    return res.status(500).json({ success: false, message: 'Error adding teacher' });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone_number, email, class_name, subject, experience_years, qualification } = req.body;
    const result = await pool.query(
      `UPDATE teachers SET name = $1, phone_number = $2, email = $3, class_name = $4, subject = $5, experience_years = $6, qualification = $7 WHERE id = $8 RETURNING *`,
      [name, phone_number, email || null, class_name || null, subject || null, experience_years || null, qualification || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    return res.json({ success: true, teacher: result.rows[0], message: 'Teacher updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating teacher' });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const studentsCheck = await pool.query('SELECT COUNT(*) FROM students WHERE teacher_name = (SELECT name FROM teachers WHERE id = $1)', [id]);
    if (parseInt(studentsCheck.rows[0].count, 10) > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete teacher. There are students assigned to this teacher.' });
    }
    const result = await pool.query('DELETE FROM teachers WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    return res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting teacher' });
  }
};

module.exports = { getTeachers, getTeacherUsers, addTeacher, updateTeacher, deleteTeacher };



