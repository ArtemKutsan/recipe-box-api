import { Router } from 'express';
import healthRouter from '#routes/health.js';
import authRouter from '#modules/auth/router.js';
import usersRouter from '#modules/users/router.js';

const router = Router();

// Группируем auth-маршруты отдельно, чтобы не смешивать их с базовыми проверками.
router.use('/auth', authRouter);
// Публичные user-маршруты живут в своём модуле.
router.use('/users', usersRouter);
router.use(healthRouter);

export default router;
