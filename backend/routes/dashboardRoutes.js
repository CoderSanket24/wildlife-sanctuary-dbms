import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getDashboardStats, getHealthAlerts } from '../controllers/dashboardController.js';

const router = Router();

router.get('/stats',  protect, getDashboardStats); // GET /api/dashboard/stats
router.get('/alerts', protect, getHealthAlerts);   // GET /api/dashboard/alerts

export default router;
