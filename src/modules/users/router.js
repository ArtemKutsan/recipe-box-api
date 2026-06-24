import { Router } from 'express';
import { getPublicProfile } from './controller.js';

const router = Router();

// Публичный профиль пользователя читается по короткому publicId.
router.get('/:publicId', getPublicProfile);

export default router;
