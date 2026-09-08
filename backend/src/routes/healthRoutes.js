import express from 'express';
import { getDBStatus } from '../config/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Management System API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: getDBStatus(),
    },
    version: '1.0.0',
  });
});

export default router;