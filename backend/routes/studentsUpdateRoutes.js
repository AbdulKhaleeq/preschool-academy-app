const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { pool } = require('../config/db');

const router = express.Router();

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, parent_phone, father_phone, teacher_name, class_name, date_of_birth, emergency_contact, medical_notes, program, notes } = req.body;
    const result = await pool.query(
      `UPDATE students SET name=$1, age=$2, parent_phone=$3, father_phone=$4, teacher_name=$5, class_name=$6, date_of_birth=$7, emergency_contact=$8, medical_notes=$9, program=$10, notes=$11 WHERE id=$12 RETURNING *`,
      [name, age || null, parent_phone || null, father_phone || null, teacher_name || null, class_name, date_of_birth || null, emergency_contact || null, medical_notes || null, program || null, notes || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    return res.json({ success: true, student: result.rows[0] });
  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).json({ success: false, message: 'Error updating student' });
  }
});

module.exports = router;


