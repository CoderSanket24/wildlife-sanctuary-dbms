import { Router } from 'express';
import { createHealthLog, getAnimalMedicalHistory } from '../controllers/healthController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validate, healthLogSchema } from '../middlewares/validate.js';

const router = Router();

// Only Rangers or Admins can submit medical intervention records
router.post('/logs', protect, restrictTo('STAFF', 'ADMIN'), validate(healthLogSchema), createHealthLog);

// Authorized staff can read historical health timelines
router.get('/timeline/:animalId', protect, restrictTo('STAFF', 'ADMIN'), getAnimalMedicalHistory);

export default router;