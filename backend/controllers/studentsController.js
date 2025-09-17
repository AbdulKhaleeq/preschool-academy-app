const { pool } = require('../config/db');

const getStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id, s.name, s.age, s.parent_phone, s.teacher_id, s.class_name,
        s.date_of_birth, s.emergency_contact, s.medical_notes, s.program,
        s.fee_amount, s.notes,
        u.name as teacher_name
      FROM students s
      LEFT JOIN users u ON s.teacher_id = u.id AND u.role = 'teacher'
      ORDER BY s.name
    `);
    return res.json({ success: true, students: result.rows });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ success: false, message: 'Error fetching students' });
  }
};

const getStudentsByParent = async (req, res) => {
  try {
    const { phone } = req.params;
    
    // Get students directly by parent_phone
    const result = await pool.query(`
      SELECT 
        s.id, s.name, s.age, s.parent_phone, s.teacher_id, s.class_name,
        s.date_of_birth, s.emergency_contact, s.medical_notes, s.program,
        s.fee_amount, s.notes,
        u.name as teacher_name,
        u.phone_number as teacher_phone
      FROM students s
      LEFT JOIN users u ON s.teacher_id = u.id AND u.role = 'teacher'
      WHERE s.parent_phone = $1
      ORDER BY s.name
    `, [phone]);
    
    return res.json({ success: true, students: result.rows });
  } catch (error) {
    console.error('Error fetching students by parent:', error);
    return res.status(500).json({ success: false, message: 'Error fetching students' });
  }
};

const getStudentsByTeacher = async (req, res) => {
  try {
    const { teacherName } = req.params;
    
    // Get teacher user ID from name
    const teacherResult = await pool.query(
      'SELECT id FROM users WHERE name = $1 AND role = $2', 
      [teacherName, 'teacher']
    );
    
    if (teacherResult.rows.length === 0) {
      return res.json({ success: true, students: [] });
    }
    
    const teacherId = teacherResult.rows[0].id;
    
    // Get students with simplified structure
    const result = await pool.query(`
      SELECT 
        s.id, s.name, s.age, s.parent_phone, s.teacher_id, s.class_name,
        s.date_of_birth, s.emergency_contact, s.medical_notes, s.program,
        s.fee_amount, s.notes
      FROM students s
      WHERE s.teacher_id = $1
      ORDER BY s.name
    `, [teacherId]);
    
    return res.json({ success: true, students: result.rows });
  } catch (error) {
    console.error('Error fetching students by teacher:', error);
    return res.status(500).json({ success: false, message: 'Error fetching students' });
  }
};

const addStudent = async (req, res) => {
  try {
    const {
      name,
      age,
      class_name,
      parent_phone,
      teacher_id,        // Accept teacher_id directly
      teacher_name,      // Or accept teacher_name for backward compatibility
      date_of_birth,
      emergency_contact,
      medical_notes,
      program,
      fee_amount,
      notes
    } = req.body;

    if (!name || !class_name) {
      return res.status(400).json({ success: false, message: 'Name and class are required' });
    }

    // Get parent_id from phone number (optional - for workflow where parent exists)
    let parent_id = null;
    if (parent_phone) {
      const parentResult = await pool.query(
        'SELECT id FROM users WHERE phone_number = $1 AND role = $2', 
        [parent_phone, 'parent']
      );
      if (parentResult.rows.length > 0) {
        parent_id = parentResult.rows[0].id;
      }
      // Don't fail if parent doesn't exist - they'll be created later
    }

    // Get teacher_id (accept either teacher_id directly or resolve from teacher_name)
    let final_teacher_id = null;
    if (teacher_id) {
      // Direct teacher_id provided
      final_teacher_id = teacher_id;
    } else if (teacher_name) {
      // Resolve teacher_name to teacher_id
      const teacherResult = await pool.query(
        'SELECT id FROM users WHERE name = $1 AND role = $2', 
        [teacher_name, 'teacher']
      );
      if (teacherResult.rows.length > 0) {
        final_teacher_id = teacherResult.rows[0].id;
      } else {
        return res.status(400).json({ 
          success: false, 
          message: `Teacher with name ${teacher_name} not found.` 
        });
      }
    }

    // Insert student with both foreign keys and workflow fields
    const result = await pool.query(
      `INSERT INTO students (
        name, age, class_name, parent_phone, parent_id, teacher_id,
        date_of_birth, emergency_contact, medical_notes, 
        program, fee_amount, notes
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [
        name, age || null, class_name, parent_phone || null, parent_id, final_teacher_id,
        date_of_birth || null, emergency_contact || null, medical_notes || null, 
        program || null, fee_amount || 0, notes || null
      ]
    );
    
    return res.json({ 
      success: true, 
      student: result.rows[0], 
      message: 'Student added successfully'
    });
  } catch (error) {
    console.error('Error adding student:', error);
    return res.status(500).json({ success: false, message: 'Error adding student', error: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, age, class_name, parent_phone, teacher_id, teacher_name,
      date_of_birth, emergency_contact, medical_notes, 
      program, fee_amount, notes
    } = req.body;

    // Resolve teacher_id if only teacher_name is provided (for backward compatibility)
    let final_teacher_id = teacher_id;
    if (!teacher_id && teacher_name) {
      const teacherResult = await pool.query(
        'SELECT id FROM users WHERE name = $1 AND role = $2', 
        [teacher_name, 'teacher']
      );
      if (teacherResult.rows.length > 0) {
        final_teacher_id = teacherResult.rows[0].id;
      }
    }

    // Resolve parent_id from parent_phone if needed
    let parent_id = null;
    if (parent_phone) {
      const parentResult = await pool.query(
        'SELECT id FROM users WHERE phone_number = $1 AND role = $2', 
        [parent_phone, 'parent']
      );
      if (parentResult.rows.length > 0) {
        parent_id = parentResult.rows[0].id;
      }
    }

    // Update student
    const result = await pool.query(
      `UPDATE students SET 
        name = $1, age = $2, class_name = $3, parent_phone = $4, parent_id = $5, teacher_id = $6,
        date_of_birth = $7, emergency_contact = $8, medical_notes = $9, 
        program = $10, fee_amount = $11, notes = $12
       WHERE id = $13 
       RETURNING *`,
      [
        name, age || null, class_name, parent_phone || null, parent_id, final_teacher_id,
        date_of_birth || null, emergency_contact || null, medical_notes || null, 
        program || null, fee_amount || 0, notes || null, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    return res.json({ 
      success: true, 
      student: result.rows[0], 
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).json({ success: false, message: 'Error updating student', error: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM students WHERE id = $1', [id]);
    return res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return res.status(500).json({ success: false, message: 'Error deleting student' });
  }
};

module.exports = { getStudents, getStudentsByParent, getStudentsByTeacher, addStudent, updateStudent, deleteStudent };


