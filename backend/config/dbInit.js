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
      age INTEGER,
      class_name VARCHAR(100) NOT NULL,
      parent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      date_of_birth DATE,
      emergency_contact VARCHAR(20),
      medical_notes TEXT,
      program TEXT CHECK (program = ANY (ARRAY['School', 'Tuition'])),
      fee_amount NUMERIC DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      parent_phone VARCHAR(20)
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
      receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      student_id INT REFERENCES students(id) ON DELETE SET NULL,
      message TEXT NOT NULL,
      conversation_id UUID DEFAULT gen_random_uuid(),
      read_at TIMESTAMP,
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
      teacher_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      start_date DATE NOT NULL,
      end_date DATE,
      is_completed BOOLEAN DEFAULT FALSE,
      created_by_name TEXT,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_students (
      id SERIAL PRIMARY KEY,
      activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      is_completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (activity_id, student_id)
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      amount NUMERIC NOT NULL DEFAULT 0,
      expense_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Enable pgcrypto for gen_random_uuid()
  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

  // Create indexes for better performance on foreign key lookups
  await pool.query('CREATE INDEX IF NOT EXISTS idx_students_parent_id ON students(parent_id);');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON students(teacher_id);');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_students_class_name ON students(class_name);');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_messages_participants ON messages(sender_id, receiver_id);');
  
  // Create activities indexes only if columns exist (they might be added via migration)
  try {
    await pool.query('CREATE INDEX IF NOT EXISTS idx_activities_teacher ON activities(teacher_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(start_date);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_activity_students_activity ON activity_students(activity_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_activity_students_student ON activity_students(student_id);');
  } catch (error) {
    // Ignore index creation errors for activities (columns might not exist yet)
    console.log('Activities indexes will be created after migration');
  }
};

module.exports = { runMigrations };


