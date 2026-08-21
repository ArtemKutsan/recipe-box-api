import { Router } from 'express';
import requireAuth from '../middleware/auth/require.js';
import { createPresignedUpload } from '../modules/uploads/controller.js';

const router = Router();

// Только авторизованный пользователь может получить ссылку на загрузку файла.
router.post('/presign', requireAuth, createPresignedUpload);

export default router;
