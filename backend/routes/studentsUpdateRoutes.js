const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { pool } = require('../config/db');

const router = express.Router();

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, age, class_name, parent_phone, teacher_id, teacher_name,
      date_of_birth, emergency_contact, medical_notes, 
      program, notes, fee_amount
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
          message: `Teacher with name ${teacher_name} not found` 
        });
      }
    }

    const result = await pool.query(
      `UPDATE students SET 
        name=$1, age=$2, class_name=$3, parent_phone=$4, parent_id=$5, teacher_id=$6,
        date_of_birth=$7, emergency_contact=$8, medical_notes=$9, 
        program=$10, notes=$11, fee_amount=$12
       WHERE id=$13 RETURNING *`,
      [
        name, age || null, class_name, parent_phone || null, parent_id, final_teacher_id,
        date_of_birth || null, emergency_contact || null, medical_notes || null, 
        program || null, notes || null, fee_amount || 0, id
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
    return res.status(500).json({ success: false, message: 'Error updating student' });
  }
});

module.exports = router;



