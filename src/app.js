import express from 'express';
import cors from 'cors';
import apiRouter from '#routes/index.js';
import config from '#config/index.js';
import notFound from '#middlewares/notFound.js';
import errorHandler from '#middlewares/errorHandler.js';

const app = express();

// Разрешаем запросы с фронтенда; если origin не задан, оставляем CORS открытым для локальных проверок и первого деплоя.
app.use(cors(config.app.clientOrigin ? { origin: config.app.clientOrigin } : undefined));
// Парсим JSON-тела запросов.
app.use(express.json());
// Монтируем все API-маршруты под версию.
app.use('/api/v1', apiRouter);
// Отдаём 404 для неизвестных путей.
app.use(notFound);
// Ловим и форматируем ошибки.
app.use(errorHandler);

export default app;
