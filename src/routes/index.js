import { Router } from 'express';
import healthRouter from '#routes/health.js';
import authRouter from '#modules/auth/router.js';

const router = Router();

// Группируем auth-маршруты отдельно, чтобы не смешивать их с базовыми проверками.
router.use('/auth', authRouter);
router.use(healthRouter);

export default router;
