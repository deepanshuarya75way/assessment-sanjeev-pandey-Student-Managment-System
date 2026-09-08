import express from 'express';
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyStudentProfile,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/me', getMyStudentProfile);

router
  .route('/')
  .get(authorize('ADMIN', 'TEACHER'), getStudents)
  .post(authorize('ADMIN', 'TEACHER'), createStudent);

router
  .route('/:id')
  .get(authorize('ADMIN', 'TEACHER'), getStudent)
  .put(authorize('ADMIN', 'TEACHER'), updateStudent)
  .delete(authorize('ADMIN'), deleteStudent);

export default router;