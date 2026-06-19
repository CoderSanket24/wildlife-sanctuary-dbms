import {Router} from 'express'
import {registerVisitor, loginVisitor, logoutVisitor} from '../controllers/authController.js'
import {validate, registerSchema, loginSchema} from '../middlewares/validate.js'

const router = Router()

router.post('/register', validate(registerSchema), registerVisitor)
router.post('/login', validate(loginSchema), loginVisitor)
router.post('/logout', loginVisitor)

export default router;