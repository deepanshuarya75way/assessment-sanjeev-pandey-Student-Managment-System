import express from 'express';
import {
  recordAttendance,
  getAttendance,
  getMyAttendance,
  getAttendanceStats,
  getStudentsForMarking,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('ADMIN', 'TEACHER'), recordAttendance);
router.get('/', authorize('ADMIN', 'TEACHER'), getAttendance);
router.get('/my-attendance', getMyAttendance);
router.get('/stats', getAttendanceStats);
router.get('/enrolled-students', authorize('ADMIN', 'TEACHER'), getStudentsForMarking);

export default router;