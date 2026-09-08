import express from 'express';
import {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getTeachers)
  .post(authorize('ADMIN'), createTeacher);

router
  .route('/:id')
  .get(getTeacher)
  .put(authorize('ADMIN'), updateTeacher)
  .delete(authorize('ADMIN'), deleteTeacher);

export default router;