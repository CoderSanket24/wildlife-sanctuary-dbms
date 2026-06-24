import { Router } from 'express';
import { createHealthLog, getAnimalMedicalHistory } from '../controllers/healthController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validate, healthLogSchema } from '../middlewares/validate.js';

const router = Router();

// Only Rangers or Admins can submit medical intervention records
router.post('/logs', protect, restrictTo('RANGER', 'ADMIN'), validate(healthLogSchema), createHealthLog);

// Authorized staff can read historical health timelines
router.get('/timeline/:animalId', protect, restrictTo('RANGER', 'ADMIN'), getAnimalMedicalHistory);

export default router;