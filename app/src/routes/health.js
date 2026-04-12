'use strict';

const express = require('express');
const router = express.Router();

const startTime = Date.now();

// GET /health – liveness probe
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
  });
});

// GET /health/ready – readiness probe
router.get('/ready', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

module.exports = router;
