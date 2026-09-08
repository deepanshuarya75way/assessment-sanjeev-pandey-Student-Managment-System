import express from 'express';
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getSubjects)
  .post(authorize('ADMIN'), createSubject);

router
  .route('/:id')
  .get(getSubject)
  .put(authorize('ADMIN'), updateSubject)
  .delete(authorize('ADMIN'), deleteSubject);

export default router;