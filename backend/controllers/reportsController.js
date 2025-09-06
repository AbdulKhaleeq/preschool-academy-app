const { pool } = require('../config/db');

const getStudentsByProgram = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COALESCE(program, 'Unknown') as program, COUNT(*)::int as count
      FROM students
      GROUP BY COALESCE(program, 'Unknown')
      ORDER BY program
    `);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching report studentsByProgram:', error);
    return res.status(500).json({ success: false, message: 'Error fetching report' });
  }
};

module.exports = { getStudentsByProgram };



