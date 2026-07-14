import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { submitFeedback } from '../controllers/adminController.js';

const router = Router();

// Any logged-in visitor can submit feedback
router.post('/', protect, submitFeedback);

export default router;
