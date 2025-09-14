const { pool } = require('./db');

async function addFeeAmountColumn() {
  try {
    console.log('🔄 Adding fee_amount column to students table...');
    
    // Add the fee_amount column if it doesn't exist
    await pool.query(`
      ALTER TABLE students 
      ADD COLUMN IF NOT EXISTS fee_amount NUMERIC DEFAULT 0
    `);
    
    console.log('✅ Fee amount column added successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding fee column:', error);
    process.exit(1);
  }
}

addFeeAmountColumn();