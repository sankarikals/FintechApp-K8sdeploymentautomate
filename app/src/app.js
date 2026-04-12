'use strict';

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const healthRouter = require('./routes/health');
const accountsRouter = require('./routes/accounts');
const transactionsRouter = require('./routes/transactions');

const app = express();

// Security headers
app.use(helmet());

// Request logging (disabled in test)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/health', healthRouter);
app.use('/api/v1/accounts', accountsRouter);
app.use('/api/v1/transactions', transactionsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// Global error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

module.exports = app;
