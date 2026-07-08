import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import {
  getAdminStats,
  getAllVisitors,
  updateVisitorRole,
  getAllStaff,
  createStaffMember,
  updateAnimalStatus,
  deleteAnimal,
  deleteZone,
  getAllTickets,
  getAllEnclosures,
  deleteEnclosure,
  getAllHealthLogs,
  deleteHealthLog,
  getAllSurveys,
  deleteSurvey,
  getAllFeedback,
  deleteFeedback,
} from '../controllers/adminController.js';

const router = Router();

// All routes require authentication + ADMIN role
router.use(protect, restrictTo('ADMIN'));

// Overview
router.get('/stats',   getAdminStats);

// Visitors
router.get('/visitors',             getAllVisitors);
router.put('/visitors/:id/role',    updateVisitorRole);

// Staff
router.get('/staff',   getAllStaff);
router.post('/staff',  createStaffMember);

// Animals
router.put('/animals/:id/status',   updateAnimalStatus);
router.delete('/animals/:id',       deleteAnimal);

// Zones
router.delete('/zones/:id',         deleteZone);

// Tickets (all visitors)
router.get('/tickets',              getAllTickets);

// Enclosures
router.get('/enclosures',           getAllEnclosures);
router.delete('/enclosures/:id',    deleteEnclosure);

// Health Logs
router.get('/health-logs',          getAllHealthLogs);
router.delete('/health-logs/:id',   deleteHealthLog);

// Surveys
router.get('/surveys',              getAllSurveys);
router.delete('/surveys/:id',       deleteSurvey);

// Feedback
router.get('/feedback',             getAllFeedback);
router.delete('/feedback/:id',      deleteFeedback);

export default router;

