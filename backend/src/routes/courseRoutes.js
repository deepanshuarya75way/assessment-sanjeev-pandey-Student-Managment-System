import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getCourses)
  .post(authorize('ADMIN'), createCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(authorize('ADMIN'), updateCourse)
  .delete(authorize('ADMIN'), deleteCourse);

export default router;