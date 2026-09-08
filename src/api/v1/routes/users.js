import { Router } from 'express';
import requireAuth from '#middlewares/auth/require.js';
import {
  getMyRecipes,
  getMyPosts,
  getPublicProfile,
  getPublicProfilePosts,
  getPublicProfileRecipes,
  updateMyAvatar,
} from '#modules/users/api/v1/controller.js';

const router = Router();

// Текущий пользователь получает список своих рецептов после проверки cookie-сессии.
router.get('/me/recipes', requireAuth, getMyRecipes);
router.get('/me/posts', requireAuth, getMyPosts);
router.patch('/me/avatar', requireAuth, updateMyAvatar);
// Публичные рецепты автора читаются по короткому publicId.
router.get('/:publicId/recipes', getPublicProfileRecipes);
router.get('/:publicId/posts', getPublicProfilePosts);
// Публичный профиль пользователя читается по короткому publicId.
router.get('/:publicId', getPublicProfile);

export default router;
