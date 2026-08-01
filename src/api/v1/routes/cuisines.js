import { Router } from 'express';
import { getCuisinesList } from '../modules/cuisines/controller.js';

const router = Router();

// Справочник кухонь доступен без авторизации.
router.get('/', getCuisinesList);

export default router;
