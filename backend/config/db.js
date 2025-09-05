const { Pool } = require('pg');

const pool = new Pool({
	user: process.env.DB_USER || 'abdulkhaleeq',
	host: process.env.DB_HOST || 'localhost',
	database: process.env.DB_NAME || 'preschool_academy_dev',
	password: process.env.DB_PASSWORD || '',
	port: parseInt(process.env.DB_PORT || '5432', 10)
});

module.exports = { pool };


