import express from 'express';

const app = express();

// JSON-body parsing нужен для будущих API-роутов.
app.use(express.json());

// Локальная проверка сервиса.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'recipe-box-api' });
});

export default app;
