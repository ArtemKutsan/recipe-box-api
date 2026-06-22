import { Router } from 'express';
import requireAuth from '#middlewares/requireAuth.js';
import { login, me, register } from './controller.js';

const router = Router();

// Эти маршруты станут точкой входа для регистрации, входа и получения профиля.
router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);

export default router;
