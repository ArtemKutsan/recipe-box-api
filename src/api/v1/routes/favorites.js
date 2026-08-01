import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { add, list, listRecipes, remove } from '#modules/favorites/controller.js';

const router = Router();

// Все Favorites принадлежат текущему пользователю из JWT.
router.get('/', requireAuth, list);
router.get('/recipes', requireAuth, listRecipes);
router.put('/:recipeId', requireAuth, add);
router.delete('/:recipeId', requireAuth, remove);

export default router;
