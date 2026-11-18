import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { createPaymentOrder, verifyAndBookTicket } from '../controllers/paymentController.js';

const router = Router();

// Step 1: Create Razorpay Order (Protected by JWT)
router.post('/create-order', protect, createPaymentOrder);

// Step 2: Verify HMAC-SHA256 Signature & Finalize PostgreSQL Booking (Protected by JWT)
router.post('/verify-and-book', protect, verifyAndBookTicket);

export default router;
