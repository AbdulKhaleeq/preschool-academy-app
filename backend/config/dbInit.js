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
      name VARCHAR(100) NOT NULL,
      age INTEGER NOT NULL,
      parent_phone VARCHAR(20) NOT NULL,
      teacher_name VARCHAR(100),
      class_name VARCHAR(100),
      date_of_birth DATE,
      emergency_contact VARCHAR(20),
      medical_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      mother_phone TEXT,
      father_phone TEXT,
      program TEXT CHECK (program = ANY (ARRAY['School', 'Tuition'])),
      notes TEXT,
      parent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      fee_amount NUMERIC DEFAULT 0
      );
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
      sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      student_id INT REFERENCES students(id) ON DELETE SET NULL,
      receiver_id INT REFERENCES users(id) ON DELETE SET NULL,
      conversation_id UUID DEFAULT gen_random_uuid(),
      read_at TIMESTAMP,
      message TEXT NOT NULL,
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

  // Per-student, per-exam feedback/comments from teachers
  await pool.query(`
    CREATE TABLE IF NOT EXISTS exam_feedback (
      id SERIAL PRIMARY KEY,
      student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      exam_type TEXT NOT NULL CHECK (exam_type IN ('FA-1','SA-1','FA-2','SA-2')),
      comments TEXT,
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (student_id, exam_type)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id SERIAL PRIMARY KEY,
      admin_id INT REFERENCES users(id) ON DELETE SET NULL,
      audience VARCHAR(20) NOT NULL CHECK (audience IN ('parents','teachers','all')),
      message TEXT NOT NULL,
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

  // Enable pgcrypto for gen_random_uuid()
  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS student_parents (
      student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      parent_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      PRIMARY KEY (student_id, parent_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS student_teachers (
      student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      teacher_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      PRIMARY KEY (student_id, teacher_id)
    );
  `);
};

module.exports = { runMigrations };


