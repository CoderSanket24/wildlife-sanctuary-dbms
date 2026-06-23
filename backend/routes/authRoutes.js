import {Router} from 'express'
import {registerVisitor, loginVisitor, logoutVisitor, getMe} from '../controllers/authController.js'
import {validate, registerSchema, loginSchema} from '../middlewares/validate.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/register', validate(registerSchema), registerVisitor)
router.post('/login', validate(loginSchema), loginVisitor)
router.post('/logout', logoutVisitor)
router.get('/me', protect, getMe)

export default router;