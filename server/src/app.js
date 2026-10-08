const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const config = require('./config/index');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const AppError = require('./utils/AppError');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));

// Request Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sanitize data against NoSQL injection (must be after body parsers)
app.use(mongoSanitize());

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting for auth routes
const authLimiter = rateLimit({
  max: 20,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api/auth', authLimiter);

// Mount Routes
app.use('/api', routes);

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
