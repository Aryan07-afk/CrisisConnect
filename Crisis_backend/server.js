const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Security Middleware ────────────────────────────────
app.use(helmet());

// CORS — restrict to frontend origin in production
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Body parser with size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serve uploaded files (coordinator document proofs, etc.)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// General API rate limiter
app.use('/api', apiLimiter);

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/users',       require('./routes/user.routes'));
app.use('/api/requests',    require('./routes/request.routes'));
app.use('/api/volunteers',  require('./routes/volunteer.routes'));
app.use('/api/assignments', require('./routes/assignment.routes'));
app.use('/api/dashboard',   require('./routes/dashboard.routes'));
app.use('/api/victim',      require('./routes/victim.routes'));
app.use('/api/coordinator-applications', require('./routes/coordinatorApplication.routes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'CrisisConnect API is running 🚨' });
});

// ── Global Error Handler ───────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start Server with Graceful Shutdown ────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    const mongoose = require('mongoose');
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });

  // Force exit after 10s if graceful shutdown fails
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
