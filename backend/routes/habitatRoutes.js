import { Router } from 'express';
import { createEnclosure, registerAnimal } from '../controllers/habitatController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validate, enclosureSchema, animalSchema } from '../middlewares/validate.js';

const router = Router();

router.post('/enclosures', protect, restrictTo('ADMIN'), validate(enclosureSchema), createEnclosure);
router.post('/animals', protect, restrictTo('RANGER', 'ADMIN'), validate(animalSchema), registerAnimal);

export default router;