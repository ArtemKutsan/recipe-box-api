import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import optionalAuth from '../middleware/optionalAuth.js';
import { create, getById, list, remove, update } from '../modules/recipes/controller.js';

const router = Router();

// Список рецептов доступен без авторизации.
router.get('/', list);
// Детальная страница рецепта может принять JWT, чтобы автор увидел private-рецепт.
router.get('/:id', optionalAuth, getById);
// Создание рецепта доступно только после проверки JWT.
router.post('/', requireAuth, create);
// Обновление рецепта доступно только владельцу после проверки JWT.
router.patch('/:id', requireAuth, update);
// Удаление рецепта доступно только владельцу после проверки JWT.
router.delete('/:id', requireAuth, remove);

export default router;
