import { Router } from "express";
import { addNewZone, getAllZones, getZoneById } from "../controllers/zoneController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { cacheResponse } from "../utils/cache.js";

const router = Router();

router.get('/',      protect, cacheResponse(60, 'zones'), getAllZones);          // GET  /api/zones      (cached 60s)
router.get('/:id',   protect, cacheResponse(60, 'zones'), getZoneById);          // GET  /api/zones/:id  (cached 60s)
router.post('/add',  protect, restrictTo('ADMIN'), addNewZone);                  // POST /api/zones/add (admin only)

export default router;