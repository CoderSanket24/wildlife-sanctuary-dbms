import { Router } from "express";
import { addNewZone } from "../controllers/zoneController.js";
import {protect,restrictTo} from "../middlewares/authMiddleware.js"
 
const router = Router()

router.post('/add', protect, restrictTo('admin'), addNewZone);

export default router;