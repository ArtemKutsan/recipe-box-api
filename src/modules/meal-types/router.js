import { Router } from 'express';
import { getMealTypesList } from './controller.js';

const router = Router();

// Справочник типов блюда доступен без авторизации.
router.get('/', getMealTypesList);

export default router;
