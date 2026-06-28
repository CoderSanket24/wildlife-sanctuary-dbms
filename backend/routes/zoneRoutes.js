import { Router } from "express";
import { addNewZone, getAllZones, getZoneById } from "../controllers/zoneController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = Router();

router.get('/',      protect, getAllZones);          // GET  /api/zones      (any authenticated user)
router.get('/:id',   protect, getZoneById);          // GET  /api/zones/:id  (any authenticated user)
router.post('/add',  protect, restrictTo('ADMIN'), addNewZone); // POST /api/zones/add (admin only)

export default router;