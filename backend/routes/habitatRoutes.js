import { Router } from 'express';
import { createEnclosure, registerAnimal, getAllAnimals, getAnimalById } from '../controllers/habitatController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validate, enclosureSchema, animalSchema } from '../middlewares/validate.js';

const router = Router();

router.post('/enclosures', protect, restrictTo('ADMIN'), validate(enclosureSchema), createEnclosure);
router.post('/animals', protect, restrictTo('STAFF', 'ADMIN'), validate(animalSchema), registerAnimal);

router.get('/',    protect, getAllAnimals);
router.get('/:id', protect, getAnimalById);  

export default router;