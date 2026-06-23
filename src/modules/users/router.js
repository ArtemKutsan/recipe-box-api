import { Router } from 'express';
import { getPublicProfile } from './controller.js';

const router = Router();

// Публичный профиль пользователя читается без авторизации.
router.get('/:id', getPublicProfile);

export default router;
