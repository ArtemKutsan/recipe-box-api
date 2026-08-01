import { Router } from 'express';
import authRouter from './routes/auth.js';
import cuisinesRouter from './routes/cuisines.js';
import favoritesRouter from './routes/favorites.js';
import healthRouter from './routes/health.js';
import mealPlansRouter from './routes/meal-plans.js';
import mealTypesRouter from './routes/meal-types.js';
import recipesRouter from './routes/recipes.js';
import usersRouter from './routes/users.js';

const router = Router();

// Группируем маршруты первой версии API по их публичным адресам.
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/meal-types', mealTypesRouter);
router.use('/cuisines', cuisinesRouter);
router.use('/recipes', recipesRouter);
router.use('/meal-plans', mealPlansRouter);
router.use('/favorites', favoritesRouter);
router.use(healthRouter);

export default router;
