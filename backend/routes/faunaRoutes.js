import { Router } from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validate, surveyLogSchema } from '../middlewares/validate.js';
import { logFaunaSurvey, getSanctuaryTelemetry } from '../controllers/surveyController.js';
import { cacheResponse } from '../utils/cache.js';

const router = Router();

// Public / Visitor Geospatial Telemetry (cached for 60s)
router.get('/telemetry', cacheResponse(60, 'telemetry'), getSanctuaryTelemetry);

// Staff / Admin Field Survey Logging
router.post('/surveys', protect, restrictTo('STAFF', 'ADMIN'), validate(surveyLogSchema), logFaunaSurvey);

export default router;
