import { Router } from 'express';
import { submitContactMessage } from '../controllers/adminController.js';

const router = Router();

// Public — no auth required
router.post('/', submitContactMessage);

export default router;
