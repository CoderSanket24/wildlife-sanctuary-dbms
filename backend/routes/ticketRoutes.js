import {Router} from 'express'
import {protect} from '../middlewares/authMiddleware.js'
import {purchaseSafariTicket} from '../controllers/ticketController.js'

const router = Router();

router.post('/book', protect, purchaseSafariTicket);

export default router;