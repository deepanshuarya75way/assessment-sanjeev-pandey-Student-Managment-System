import express from 'express';
import {
  saveMarks,
  getMarksList,
  getStudentResult,
  getMyResults,
} from '../controllers/marksController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('ADMIN', 'TEACHER'), saveMarks);
router.get('/', authorize('ADMIN', 'TEACHER'), getMarksList);
router.get('/my-results', getMyResults);
router.get('/student-result/:studentId', authorize('ADMIN', 'TEACHER'), getStudentResult);

export default router;