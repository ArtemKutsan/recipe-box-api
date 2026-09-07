import { Router } from 'express';
import requireAuth from '../middleware/auth/require.js';
import { list, markRead } from '../modules/notifications/controller.js';

const router = Router();

// Уведомления доступны только их получателю из cookie-сессии.
router.get('/', requireAuth, list);
router.patch('/:notificationId/read', requireAuth, markRead);

export default router;
