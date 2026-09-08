import { Router } from 'express';
import optionalAuth from '#middlewares/auth/optional.js';
import requireAuth from '#middlewares/auth/require.js';
import {
  createPresignedDownload,
  createPresignedUpload,
} from '#modules/uploads/api/v1/controller.js';

const router = Router();

// Только авторизованный пользователь может получить ссылку на загрузку файла.
router.post('/upload-url', requireAuth, createPresignedUpload);
// Для чтения публичный рецепт можно открыть без входа, приватный проверяется в сервисе.
router.post('/download-url', optionalAuth, createPresignedDownload);

export default router;
