import express from 'express';
import apiRouter from '#routes/index.js';
import notFound from '#middlewares/notFound.js';
import errorHandler from '#middlewares/errorHandler.js';

const app = express();

// Парсим JSON-тела запросов.
app.use(express.json());
// Монтируем все API-маршруты под версию.
app.use('/api/v1', apiRouter);
// Отдаём 404 для неизвестных путей.
app.use(notFound);
// Ловим и форматируем ошибки.
app.use(errorHandler);

export default app;
