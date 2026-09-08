import express from 'express';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAnnouncementAsRead,
  markAllAnnouncementsAsRead,
} from '../controllers/announcementController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAnnouncements);
router.post('/mark-all-read', markAllAnnouncementsAsRead);
router.get('/:id', getAnnouncementById);
router.post('/', authorize('ADMIN'), createAnnouncement);
router.put('/:id', authorize('ADMIN'), updateAnnouncement);
router.patch('/:id/read', markAnnouncementAsRead);
router.delete('/:id', authorize('ADMIN'), deleteAnnouncement);

export default router;

