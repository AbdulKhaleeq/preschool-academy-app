const { Pool } = require('pg');

// Use DATABASE_URL for production (Railway) or individual env vars for development
const pool = new Pool({
	connectionString: process.env.DATABASE_URL || undefined,
	user: process.env.DATABASE_URL ? undefined : (process.env.DB_USER || 'abdulkhaleeq'),
	host: process.env.DATABASE_URL ? undefined : (process.env.DB_HOST || 'localhost'),
	database: process.env.DATABASE_URL ? undefined : (process.env.DB_NAME || 'preschool_academy_dev'),
	password: process.env.DATABASE_URL ? undefined : (process.env.DB_PASSWORD || ''),
	port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || '5432', 10),
	ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = { pool };


