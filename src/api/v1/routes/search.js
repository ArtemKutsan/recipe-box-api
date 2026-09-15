import { Router } from 'express';
import { list } from '#modules/search/api/v1/controller.js';

const router = Router();

router.get('/', list);

export default router;
