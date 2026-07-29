const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Connect to Database
const connectDB = require('./src/config/db');
connectDB();

// Route files
const authRoutes = require('./src/routes/authRoutes');

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading uploaded images in local frontend
}));

// CORS Configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// Logger Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiter configuration
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 mins
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api', limiter);

// Mount routers
app.use('/api/v1/auth', authRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notes Tracker API is running',
    data: { version: '1.0.0' }
  });
});

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not Found - Path ${req.originalUrl} does not exist`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Handle Mongoose duplicate key error (e.g. unique email)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate database entry: ' + Object.keys(err.keyValue).join(', ') + ' must be unique';
  }

  // Handle Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with invalid ID structure: ${err.value}`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Not authorized, token failed';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Not authorized, token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
