const { pool } = require('../config/db');

const upsertDailyReport = async (req, res) => {
  try {
    const { student_id, report_date, notes, attendance } = req.body;
    if (!student_id || !report_date) return res.status(400).json({ success: false, message: 'student_id and report_date are required' });
    const result = await pool.query(
      `INSERT INTO daily_reports (student_id, report_date, notes, attendance)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, report_date) DO UPDATE SET notes = EXCLUDED.notes, attendance = EXCLUDED.attendance
       RETURNING *`,
      [student_id, report_date, notes || null, typeof attendance === 'boolean' ? attendance : null]
    );
    return res.json({ success: true, report: result.rows[0] });
  } catch (error) {
    console.error('Error upserting daily report:', error);
    return res.status(500).json({ success: false, message: 'Error saving report' });
  }
};

const getDailyReportsForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await pool.query('SELECT * FROM daily_reports WHERE student_id = $1 ORDER BY report_date DESC', [studentId]);
    return res.json({ success: true, reports: result.rows });
  } catch (error) {
    console.error('Error fetching daily reports:', error);
    return res.status(500).json({ success: false, message: 'Error fetching reports' });
  }
};

const getDailyReportByDate = async (req, res) => {
  try {
    const { studentId, date } = req.params;
    const result = await pool.query(
      'SELECT * FROM daily_reports WHERE student_id = $1 AND report_date = $2 LIMIT 1',
      [studentId, date]
    );
    return res.json({ success: true, report: result.rows[0] || null });
  } catch (error) {
    console.error('Error fetching daily report by date:', error);
    return res.status(500).json({ success: false, message: 'Error fetching report' });
  }
};

const getReportDatesWithNotes = async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await pool.query(
      `SELECT report_date
       FROM daily_reports
       WHERE student_id = $1 AND notes IS NOT NULL AND TRIM(notes) <> ''
       ORDER BY report_date DESC`,
      [studentId]
    );
    const dates = result.rows.map(r => r.report_date);
    return res.json({ success: true, dates });
  } catch (error) {
    console.error('Error fetching report dates with notes:', error);
    return res.status(500).json({ success: false, message: 'Error fetching dates' });
  }
};

module.exports = { upsertDailyReport, getDailyReportsForStudent, getDailyReportByDate, getReportDatesWithNotes };


