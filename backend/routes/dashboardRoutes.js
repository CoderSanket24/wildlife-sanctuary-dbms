import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getDashboardStats, getHealthAlerts } from '../controllers/dashboardController.js';
import { cacheResponse } from '../utils/cache.js';

const router = Router();

router.get('/stats',  protect, cacheResponse(30, 'stats'), getDashboardStats); // GET /api/dashboard/stats (cached 30s)
router.get('/alerts', protect, getHealthAlerts);                               // GET /api/dashboard/alerts

export default router;
