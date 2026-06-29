import { Router } from 'express';
import requireAuth from '#middlewares/requireAuth.js';
import { getMyRecipes, getPublicProfile, getPublicProfileRecipes } from './controller.js';

const router = Router();

// Текущий пользователь получает список своих рецептов после проверки JWT.
router.get('/me/recipes', requireAuth, getMyRecipes);
// Публичные рецепты автора читаются по короткому publicId.
router.get('/:publicId/recipes', getPublicProfileRecipes);
// Публичный профиль пользователя читается по короткому publicId.
router.get('/:publicId', getPublicProfile);

export default router;
