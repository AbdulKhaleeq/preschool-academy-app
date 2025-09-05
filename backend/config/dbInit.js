const { pool } = require('./db');

const runMigrations = async () => {
  // Create core tables if they don't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT,
      phone_number TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','teacher','parent')),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS teachers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone_number TEXT UNIQUE NOT NULL,
      email TEXT,
      class_name TEXT,
      subject TEXT,
      experience_years INT,
      qualification TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      age INT,
      parent_phone TEXT,
      father_phone TEXT,
      teacher_name TEXT,
      class_name TEXT NOT NULL,
      date_of_birth DATE,
      emergency_contact TEXT,
      medical_notes TEXT,
      program TEXT,
      notes TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_reports (
      id SERIAL PRIMARY KEY,
      student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      report_date DATE NOT NULL,
      notes TEXT,
      attendance BOOLEAN,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (student_id, report_date)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      student_id INT REFERENCES students(id) ON DELETE SET NULL,
      teacher_name TEXT,
      parent_phone TEXT,
      from_role TEXT NOT NULL CHECK (from_role IN ('teacher','parent')),
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS exam_results (
      id SERIAL PRIMARY KEY,
      student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      exam_type TEXT NOT NULL CHECK (exam_type IN ('FA-1','SA-1','FA-2','SA-2')),
      subject TEXT NOT NULL,
      marks NUMERIC,
      total NUMERIC,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_by_role TEXT NOT NULL CHECK (created_by_role IN ('admin','teacher')),
      created_by_name TEXT,
      audience TEXT DEFAULT 'all',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      scheduled_at TIMESTAMP,
      created_by_name TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS fees (
      id SERIAL PRIMARY KEY,
      student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      month INT NOT NULL,
      year INT NOT NULL,
      amount NUMERIC DEFAULT 0,
      is_paid BOOLEAN DEFAULT FALSE,
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (student_id, month, year)
    );
  `);
};

module.exports = { runMigrations };


