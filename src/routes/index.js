import { Router } from 'express';
import healthRouter from '#routes/health.js';
import authRouter from '#modules/auth/router.js';
import usersRouter from '#modules/users/router.js';
import mealTypesRouter from '#modules/meal-types/router.js';
import cuisinesRouter from '#modules/cuisines/router.js';

const router = Router();

// Группируем auth-маршруты отдельно, чтобы не смешивать их с базовыми проверками.
router.use('/auth', authRouter);
// Публичные user-маршруты живут в своём модуле.
router.use('/users', usersRouter);
// Справочники рецептов нужны фильтрам и доступны без авторизации.
router.use('/meal-types', mealTypesRouter);
router.use('/cuisines', cuisinesRouter);
router.use(healthRouter);

export default router;
