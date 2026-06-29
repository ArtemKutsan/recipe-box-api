import { Router } from 'express';
import requireAuth from '#middlewares/requireAuth.js';
import { create, getById, list, update } from './controller.js';

const router = Router();

// Список рецептов доступен без авторизации.
router.get('/', list);
// Детальная страница рецепта тоже доступна без авторизации.
router.get('/:id', getById);
// Создание рецепта доступно только после проверки JWT.
router.post('/', requireAuth, create);
// Обновление рецепта доступно только владельцу после проверки JWT.
router.patch('/:id', requireAuth, update);

export default router;
