import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { submitFeedback, getPublicFeedback } from '../controllers/adminController.js';

const router = Router();

// Public — anyone can view feedback
router.get('/', getPublicFeedback);

// Auth required — only logged-in visitors can submit
router.post('/', protect, submitFeedback);

export default router;
