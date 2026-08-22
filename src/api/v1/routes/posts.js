import { Router } from 'express';
import requireAuth from '../middleware/auth/require.js';
import { create, getById, list, remove, update } from '../modules/posts/controller.js';

const router = Router();

// Публичные посты доступны без авторизации.
router.get('/', list);
router.get('/:id', getById);
// Изменять посты может только их автор.
router.post('/', requireAuth, create);
router.patch('/:id', requireAuth, update);
router.delete('/:id', requireAuth, remove);

export default router;
