process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection:', reason);
});


const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const studentsRoutes = require('./routes/studentsRoutes');
const teachersRoutes = require('./routes/teachersRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const dailyReportsRoutes = require('./routes/dailyReportsRoutes');
const messagesRoutes = require('./routes/messagesRoutes');
const examsRoutes = require('./routes/examsRoutes');
const announcementsRoutes = require('./routes/announcementsRoutes');
const activitiesRoutes = require('./routes/activitiesRoutes');
const feesRoutes = require('./routes/feesRoutes');
const studentsUpdateRoutes = require('./routes/studentsUpdateRoutes');
const { runMigrations } = require('./config/dbInit');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware
app.use(cors());
app.use(express.json());

// 🔍 Log every request (debugging)
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl}`, req.body || {});
  next();
});

// 🔍 Log errors globally (catch unhandled)
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});


// Serve static files from React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Preschool Academy API is running!', 
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Preschool Academy API' });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/students', studentsRoutes);
app.use('/teachers', teachersRoutes);
app.use('/reports', reportsRoutes);
app.use('/daily-reports', dailyReportsRoutes);
app.use('/messages', messagesRoutes);
app.use('/exams', examsRoutes);
app.use('/announcements', announcementsRoutes);
app.use('/activities', activitiesRoutes);
app.use('/fees', feesRoutes);
app.use('/students-update', studentsUpdateRoutes);

runMigrations()
  .then(() => {
    console.log("✅ Migrations completed successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Migration error:', err);
    // comment this out temporarily to keep server alive
    // process.exit(1);
  });


//   setInterval(() => {
//   console.log("💓 Backend heartbeat: still alive", new Date().toISOString());
// }, 5000);

