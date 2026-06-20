import { Router } from 'express';

const router = Router();

// Простая проверка, что сервис отвечает.
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'recipe-box-api' });
});

export default router;
