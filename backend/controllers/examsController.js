const { pool } = require('../config/db');

const addOrUpdateResult = async (req, res) => {
  try {
    const { student_id, exam_type, subject, marks, total } = req.body;
    if (!student_id || !exam_type || !subject) return res.status(400).json({ success: false, message: 'Missing fields' });
    const result = await pool.query(
      `INSERT INTO exam_results (student_id, exam_type, subject, marks, total)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [student_id, exam_type, subject, marks || null, total || null]
    );
    return res.json({ success: true, result: result.rows[0] });
  } catch (error) {
    console.error('Error adding exam result:', error);
    return res.status(500).json({ success: false, message: 'Error adding result' });
  }
};

const getResultsForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await pool.query('SELECT * FROM exam_results WHERE student_id = $1 ORDER BY created_at DESC', [studentId]);
    return res.json({ success: true, results: result.rows });
  } catch (error) {
    console.error('Error fetching exam results:', error);
    return res.status(500).json({ success: false, message: 'Error fetching results' });
  }
};

const updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, marks, total } = req.body;
    const result = await pool.query('UPDATE exam_results SET subject=$1, marks=$2, total=$3 WHERE id=$4 RETURNING *', [subject, marks || null, total || null, id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Result not found' });
    return res.json({ success: true, result: result.rows[0] });
  } catch (error) {
    console.error('Error updating exam result:', error);
    return res.status(500).json({ success: false, message: 'Error updating result' });
  }
};

const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM exam_results WHERE id = $1', [id]);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting exam result:', error);
    return res.status(500).json({ success: false, message: 'Error deleting result' });
  }
};

module.exports = { addOrUpdateResult, getResultsForStudent, updateResult, deleteResult };


