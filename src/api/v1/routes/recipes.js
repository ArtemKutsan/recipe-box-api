import { Router } from 'express';
import requireAuth from '../middleware/auth/require.js';
import optionalAuth from '../middleware/auth/optional.js';
import { create, getById, list, remove, update } from '../modules/recipes/controller.js';

const router = Router();

// Список рецептов доступен без авторизации.
router.get('/', list);
// Детальная страница рецепта может принять cookie-сессию, чтобы автор увидел private-рецепт.
router.get('/:id', optionalAuth, getById);
// Создание рецепта доступно только после проверки cookie-сессии.
router.post('/', requireAuth, create);
// Обновление рецепта доступно только владельцу после проверки cookie-сессии.
router.patch('/:id', requireAuth, update);
// Удаление рецепта доступно только владельцу после проверки cookie-сессии.
router.delete('/:id', requireAuth, remove);

export default router;
