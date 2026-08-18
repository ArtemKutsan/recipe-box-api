import { Router } from 'express';
import requireAuth from '../middleware/auth/require.js';
import { login, logout, me, register } from '../modules/auth/controller.js';

const router = Router();

// Эти маршруты служат точкой входа для регистрации, входа и получения профиля.
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
