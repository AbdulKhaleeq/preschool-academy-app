const { pool } = require('../config/db');

// Get fees for a specific month/year with student details
const getMonthlyFees = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();


    // Get all students with Tuition program and their fee information
    const result = await pool.query(`
      SELECT 
        s.id as student_id,
        s.name,
        s.class_name,
        s.program,
        s.fee_amount,
        f.id as fee_id,
        f.amount,
        f.is_paid,
        CASE WHEN f.is_paid = true THEN f.updated_at ELSE NULL END as paid_date
      FROM students s
      LEFT JOIN fees f ON s.id = f.student_id 
        AND f.month = $1 AND f.year = $2
      WHERE s.program = 'Tuition' OR f.id IS NOT NULL
      ORDER BY s.name
    `, [currentMonth, currentYear]);

    const fees = result.rows.map(row => ({
      student_id: row.student_id,
      student_name: row.name,
      class_name: row.class_name,
      program: row.program,
      amount: row.amount || row.fee_amount || 0,
      is_paid: row.is_paid || false,
      paid_date: row.paid_date,
      roll_no: `${row.student_id.toString().padStart(3, '0')}`
    }));

    return res.json({ success: true, fees, month: currentMonth, year: currentYear });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error getting monthly fees' });
  }
};

// Mark fee as paid/unpaid
const markFeeStatus = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month, year, is_paid } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year are required' });
    }

    console.log(`💳 Updating fee status for student ${studentId}: ${is_paid ? 'PAID' : 'UNPAID'}`);

    // First check if fee record exists, if not get student's default fee amount
    const existingFeeResult = await pool.query(
      'SELECT amount FROM fees WHERE student_id = $1 AND month = $2 AND year = $3', 
      [studentId, month, year]
    );

    let feeAmount;
    if (existingFeeResult.rows.length > 0) {
      // Use existing fee amount
      feeAmount = existingFeeResult.rows[0].amount;
    } else {
      // Get student's default fee amount for new records
      const studentResult = await pool.query('SELECT fee_amount FROM students WHERE id = $1', [studentId]);
      if (studentResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      feeAmount = studentResult.rows[0].fee_amount || 0;
    }

    const result = await pool.query(`
      INSERT INTO fees (student_id, month, year, amount, is_paid, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (student_id, month, year) 
      DO UPDATE SET 
        is_paid = EXCLUDED.is_paid,
        updated_at = NOW()
      RETURNING *
    `, [studentId, month, year, feeAmount, !!is_paid]);

    return res.json({ success: true, fee: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating fee status' });
  }
};

// Add a student to the fee tracking (for School program students)
const addStudentToFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { amount, month, year } = req.body;
    
    // Use current month/year if not provided
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();
    
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    console.log(`➕ Adding student ${studentId} to fee tracking for ${targetMonth}/${targetYear}`);

    // Check if student exists
    const studentResult = await pool.query('SELECT * FROM students WHERE id = $1', [studentId]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const result = await pool.query(`
      INSERT INTO fees (student_id, month, year, amount, is_paid)
      VALUES ($1, $2, $3, $4, false)
      ON CONFLICT (student_id, month, year) 
      DO UPDATE SET amount = EXCLUDED.amount
      RETURNING *
    `, [studentId, targetMonth, targetYear, amount]);

    return res.json({ success: true, fee: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error adding student to fees' });
  }
};

// Generate fees for a new month (auto-generate for all Tuition students)
const generateNewMonth = async (req, res) => {
  try {
    const { month, year } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year are required' });
    }

    console.log(`🔄 Generating fees for ${month}/${year}`);

    // Get all students with Tuition program
    const studentsResult = await pool.query(`
      SELECT id, fee_amount FROM students 
      WHERE program = 'Tuition' AND fee_amount > 0
    `);

    let createdCount = 0;
    for (const student of studentsResult.rows) {
      try {
        await pool.query(`
          INSERT INTO fees (student_id, month, year, amount, is_paid)
          VALUES ($1, $2, $3, $4, false)
          ON CONFLICT (student_id, month, year) DO NOTHING
        `, [student.id, month, year, student.fee_amount]);
        createdCount++;
      } catch (err) {
        console.log(`⚠️ Fee already exists for student ${student.id}`);
      }
    }

    return res.json({ 
      success: true, 
      message: `Generated fees for ${createdCount} students`,
      generated: createdCount 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error generating new month fees' });
  }
};

// Get students not in current fee list (for adding to fees)
const getAvailableStudents = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    console.log(`👥 Getting available students for ${currentMonth}/${currentYear}`);

    const result = await pool.query(`
      SELECT s.id, s.name, s.class_name, s.program, s.fee_amount
      FROM students s
      WHERE s.id NOT IN (
        SELECT student_id FROM fees 
        WHERE month = $1 AND year = $2
      )
      AND s.program = 'School'
      ORDER BY s.name
    `, [currentMonth, currentYear]);

    return res.json({ success: true, students: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error getting available students' });
  }
};

// Generate financial report for a month
const generateReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    console.log(`📋 Generating report for ${currentMonth}/${currentYear}`);

    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN f.is_paid = true THEN 1 END) as paid_count,
        COUNT(CASE WHEN f.is_paid = false THEN 1 END) as unpaid_count,
        COALESCE(SUM(f.amount), 0) as total_amount,
        COALESCE(SUM(CASE WHEN f.is_paid = true THEN f.amount ELSE 0 END), 0) as paid_amount,
        COALESCE(SUM(CASE WHEN f.is_paid = false THEN f.amount ELSE 0 END), 0) as unpaid_amount
      FROM fees f
      WHERE f.month = $1 AND f.year = $2
    `, [currentMonth, currentYear]);

    const summary = result.rows[0];
    const report = {
      month: currentMonth,
      year: currentYear,
      total_students: parseInt(summary.total_students) || 0,
      paid_count: parseInt(summary.paid_count) || 0,
      unpaid_count: parseInt(summary.unpaid_count) || 0,
      total_amount: parseFloat(summary.total_amount) || 0,
      paid_amount: parseFloat(summary.paid_amount) || 0,
      unpaid_amount: parseFloat(summary.unpaid_amount) || 0
    };

    return res.json({ success: true, report });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error generating report' });
  }
};

// Get pending dues for a specific parent
const getParentDues = async (req, res) => {
  try {
    const { parentId } = req.params;

    // Get all unpaid fees for students linked to this parent
    const result = await pool.query(`
      SELECT 
        s.id as student_id,
        s.name as student_name,
        s.class_name,
        f.id as fee_id,
        f.amount,
        f.month,
        f.year,
        f.is_paid
      FROM students s
      JOIN fees f ON s.id = f.student_id
      WHERE s.parent_id = $1 
        AND f.is_paid = false
      ORDER BY f.year DESC, f.month DESC
    `, [parentId]);

    const pendingDues = result.rows.map(row => ({
      student_id: row.student_id,
      student_name: row.student_name,
      class_name: row.class_name,
      fee_id: row.fee_id,
      amount: parseFloat(row.amount),
      month: row.month,
      year: row.year,
      monthName: getMonthName(row.month)
    }));

    // Calculate total pending amount
    const totalPending = pendingDues.reduce((sum, due) => sum + due.amount, 0);

    return res.json({ 
      success: true, 
      pendingDues,
      totalPending,
      count: pendingDues.length
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error getting parent dues' 
    });
  }
};

// Helper function to get month name
const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Unknown';
};

module.exports = { 
  getMonthlyFees,
  markFeeStatus, 
  addStudentToFees,
  generateNewMonth,
  getAvailableStudents,
  generateReport,
  getParentDues
};



