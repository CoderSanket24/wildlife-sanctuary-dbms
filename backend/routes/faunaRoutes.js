import {Router} from 'express'
import {protect , restrictTo } from '../middlewares/authMiddleware.js'
import { validate, surveyLogSchema } from '../middlewares/validate.js'
import { logFaunaSurvey } from '../controllers/surveyController.js'

const router = Router()

router.post('/surveys', protect, restrictTo('STAFF', 'ADMIN'), validate(surveyLogSchema), logFaunaSurvey)

export default router