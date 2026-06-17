import {Router} from 'express'
import {registerVisitor, loginVisitor} from '../controllers/authController.js'
import {validate, registerSchema, loginSchema} from '../middlewares/validate.js'

const router = Router()

router.post('/register', validate(registerSchema), registerVisitor)
router.post('/login', validate(loginSchema), loginVisitor)

export default router;