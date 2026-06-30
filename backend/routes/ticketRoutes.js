import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { purchaseSafariTicket, getMyTickets } from '../controllers/ticketController.js';

const router = Router();

router.get('/my',   protect, getMyTickets);        // GET  /api/ticket/my   — visitor's ticket history
router.post('/book', protect, purchaseSafariTicket); // POST /api/ticket/book — book a ticket

export default router;