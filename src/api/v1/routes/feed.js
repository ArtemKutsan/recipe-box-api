import { Router } from 'express';
import { list } from '../modules/feed/controller.js';

const router = Router();

// Лента доступна без авторизации и показывает только публичный контент.
router.get('/', list);

export default router;
