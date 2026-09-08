import { Router } from 'express';
import requireAuth from '../middleware/auth/require.js';
import { postCommentHandlers } from '#modules/comments/api/v1/controller.js';
import { create, getById, list, remove, update } from '#modules/posts/api/v1/controller.js';

const router = Router();

// Публичные посты доступны без авторизации.
router.get('/', list);
// Комментарии доступны у публичных постов; создание требует cookie-сессию.
router.get('/:postId/comments', postCommentHandlers.list);
router.post('/:postId/comments', requireAuth, postCommentHandlers.create);
router.get('/:id', getById);
// Изменять посты может только их автор.
router.post('/', requireAuth, create);
router.patch('/:id', requireAuth, update);
router.delete('/:id', requireAuth, remove);

export default router;
