import { Router } from 'express';
import { getMealTypesList } from '../modules/meal-types/controller.js';

const router = Router();

// Справочник типов блюда доступен без авторизации.
router.get('/', getMealTypesList);

export default router;
