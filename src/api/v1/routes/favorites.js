import { Router } from 'express';
import requireAuth from '#middlewares/auth/require.js';
import { add, list, listRecipes, remove } from '#modules/favorites/api/v1/controller.js';

const router = Router();

// Все Favorites принадлежат текущему пользователю из cookie-сессии.
router.get('/', requireAuth, list);
router.get('/recipes', requireAuth, listRecipes);
router.put('/:recipeId', requireAuth, add);
router.delete('/:recipeId', requireAuth, remove);

export default router;
