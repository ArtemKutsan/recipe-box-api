import { Router } from 'express';
import requireAuth from '#middlewares/requireAuth.js';
import { getCurrent, updateCurrentSlot } from '#modules/meal-plans/controller.js';

const router = Router();

// Current meal plan доступен только после проверки JWT.
router.get('/current', requireAuth, getCurrent);
// Один слот current meal plan меняем отдельно от остальной недели.
router.patch('/current/slot', requireAuth, updateCurrentSlot);

export default router;
