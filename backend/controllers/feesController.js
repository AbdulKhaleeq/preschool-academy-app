const { pool } = require('../config/db');

const listFeesForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await pool.query('SELECT * FROM fees WHERE student_id = $1 ORDER BY year DESC, month DESC', [studentId]);
    return res.json({ success: true, fees: result.rows });
  } catch (error) {
    console.error('Error listing fees:', error);
    return res.status(500).json({ success: false, message: 'Error listing fees' });
  }
};

const markFeeStatus = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month, year, is_paid } = req.body;
    if (!month || !year) return res.status(400).json({ success: false, message: 'month and year required' });
    const result = await pool.query(
      `INSERT INTO fees (student_id, month, year, is_paid)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, month, year) DO UPDATE SET is_paid = EXCLUDED.is_paid, updated_at = NOW()
       RETURNING *`,
      [studentId, month, year, !!is_paid]
    );
    return res.json({ success: true, fee: result.rows[0] });
  } catch (error) {
    console.error('Error updating fee status:', error);
    return res.status(500).json({ success: false, message: 'Error updating fee status' });
  }
};

module.exports = { listFeesForStudent, markFeeStatus };


