const { pool } = require('../config/db');

const getStudents = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY name');
    return res.json({ success: true, students: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching students' });
  }
};

const getStudentsByParent = async (req, res) => {
  try {
    const { phone } = req.params;
    const result = await pool.query('SELECT * FROM students WHERE parent_phone = $1 ORDER BY name', [phone]);
    return res.json({ success: true, students: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching students' });
  }
};

const getStudentsByTeacher = async (req, res) => {
  try {
    const { teacherName } = req.params;
    const result = await pool.query('SELECT * FROM students WHERE teacher_name = $1 ORDER BY name', [teacherName]);
    return res.json({ success: true, students: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching students' });
  }
};

const addStudent = async (req, res) => {
  try {
    const {
      name,
      age,
      parent_phone,
      teacher_name,
      class_name,
      date_of_birth,
      emergency_contact,
      medical_notes,
      // optional alternative fields (future schema)
      mother_phone,
      father_phone,
      program,
      notes
    } = req.body;

    if (!name || !class_name) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Prefer legacy schema to match existing UI; fall back to alternative if provided
    if (typeof age !== 'undefined' || typeof parent_phone !== 'undefined' || typeof teacher_name !== 'undefined') {
      const result = await pool.query(
        `INSERT INTO students (name, age, parent_phone, teacher_name, class_name, date_of_birth, emergency_contact, medical_notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [name, age || null, parent_phone || null, teacher_name || null, class_name, date_of_birth || null, emergency_contact || null, medical_notes || null]
      );
      return res.json({ success: true, student: result.rows[0], message: 'Student added successfully' });
    }

    // Alternative insert if using updated fields
    const result = await pool.query(
      `INSERT INTO students (name, date_of_birth, class_name, parent_phone, father_phone, program, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, date_of_birth || null, class_name, mother_phone || null, father_phone || null, program || null, notes || null]
    );
    return res.json({ success: true, student: result.rows[0], message: 'Student added successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error adding student' });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM students WHERE id = $1', [id]);
    return res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error deleting student' });
  }
};

module.exports = { getStudents, getStudentsByParent, getStudentsByTeacher, addStudent, deleteStudent };


