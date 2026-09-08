import { Router } from 'express';
import requireAuth from '#middlewares/auth/require.js';
import { list, markAllRead, markRead } from '#modules/notifications/api/v1/controller.js';

const router = Router();

// Уведомления доступны только их получателю из cookie-сессии.
router.get('/', requireAuth, list);
router.patch('/read-all', requireAuth, markAllRead);
router.patch('/:notificationId/read', requireAuth, markRead);

export default router;
