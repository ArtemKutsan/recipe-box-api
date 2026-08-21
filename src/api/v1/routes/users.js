import { Router } from 'express';
import requireAuth from '../middleware/auth/require.js';
import {
  getMyRecipes,
  getPublicProfile,
  getPublicProfileRecipes,
  updateMyAvatar,
} from '../modules/users/controller.js';

const router = Router();

// Текущий пользователь получает список своих рецептов после проверки cookie-сессии.
router.get('/me/recipes', requireAuth, getMyRecipes);
router.patch('/me/avatar', requireAuth, updateMyAvatar);
// Публичные рецепты автора читаются по короткому publicId.
router.get('/:publicId/recipes', getPublicProfileRecipes);
// Публичный профиль пользователя читается по короткому publicId.
router.get('/:publicId', getPublicProfile);

export default router;
