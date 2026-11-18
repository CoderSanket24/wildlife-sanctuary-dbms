import { Router } from 'express';
import { createEnclosure, registerAnimal, getAllAnimals, getAnimalById } from '../controllers/habitatController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validate, enclosureSchema, animalSchema } from '../middlewares/validate.js';
import { cacheResponse } from '../utils/cache.js';

const router = Router();

router.post('/enclosures', protect, restrictTo('ADMIN'), validate(enclosureSchema), createEnclosure);
router.post('/animals', protect, restrictTo('STAFF', 'ADMIN'), validate(animalSchema), registerAnimal);

router.get('/',    protect, cacheResponse(60, 'sanctuary'), getAllAnimals);
router.get('/:id', protect, cacheResponse(60, 'sanctuary'), getAnimalById);  

export default router;