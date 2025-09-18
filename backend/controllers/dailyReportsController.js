const { pool } = require('../config/db');

// Helper function to format date without timezone conversion
const formatDateOnly = (date) => {
  if (!date) return null;
  if (typeof date === 'string') return date.split('T')[0];
  if (date instanceof Date) {
    // Use local date components to avoid timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return date;
};

const upsertDailyReport = async (req, res) => {
  try {
    const { student_id, report_date, notes, attendance } = req.body;
    if (!student_id || !report_date) return res.status(400).json({ success: false, message: 'student_id and report_date are required' });
    
    console.log('Received report_date:', report_date, 'type:', typeof report_date);
    
    // Ensure report_date is treated as a date-only string (no timezone conversion)
    // The frontend should send dates in YYYY-MM-DD format
    const dateOnly = report_date.split('T')[0]; // Remove any time component if present
    console.log('Using dateOnly:', dateOnly);
    
    const result = await pool.query(
      `INSERT INTO daily_reports (student_id, report_date, notes, attendance)
       VALUES ($1, $2::date, $3, $4)
       ON CONFLICT (student_id, report_date) DO UPDATE SET notes = EXCLUDED.notes, attendance = EXCLUDED.attendance
       RETURNING *`,
      [student_id, dateOnly, notes || null, typeof attendance === 'boolean' ? attendance : null]
    );
    
    console.log('Saved report with date:', result.rows[0].report_date);
    
    // Format the returned report_date as string to avoid timezone issues
    const savedReport = { ...result.rows[0] };
    savedReport.report_date = formatDateOnly(savedReport.report_date);
    
    return res.json({ success: true, report: savedReport });
  } catch (error) {
    console.error('Error upserting daily report:', error);
    return res.status(500).json({ success: false, message: 'Error saving report' });
  }
};

const getDailyReportsForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await pool.query('SELECT * FROM daily_reports WHERE student_id = $1 ORDER BY report_date DESC', [studentId]);
    
    // Format the report_date as a string to avoid timezone issues
    const reports = result.rows.map(row => ({
      ...row,
      report_date: formatDateOnly(row.report_date)
    }));
    
    return res.json({ success: true, reports });
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
    
    const report = result.rows[0];
    if (report) {
      report.report_date = formatDateOnly(report.report_date);
    }
    
    return res.json({ success: true, report: report || null });
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


