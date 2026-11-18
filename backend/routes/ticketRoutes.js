import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { 
  purchaseSafariTicket, 
  getMyTickets,
  downloadTicketPdf,
  verifyTicket,
  checkInTicket
} from '../controllers/ticketController.js';

const router = Router();

router.get('/my',           protect, getMyTickets);
router.post('/book',        protect, purchaseSafariTicket);
router.get('/:id/pdf',      protect, downloadTicketPdf);
router.get('/verify/:id',   protect, verifyTicket);
router.post('/check-in',    protect, restrictTo('STAFF', 'ADMIN'), checkInTicket);

export default router;