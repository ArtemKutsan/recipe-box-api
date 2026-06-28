import { Router } from 'express';
import requireAuth from '#middlewares/requireAuth.js';
import { create } from './controller.js';

const router = Router();

// Создание рецепта доступно только после проверки JWT.
router.post('/', requireAuth, create);

export default router;
