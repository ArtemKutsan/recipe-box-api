import express from 'express';
import cors from 'cors';
import routerV1 from '#api/v1/router.js';
import config from '#config/index.js';
import notFound from '#middlewares/notFound.js';
import errorHandler from '#middlewares/errorHandler.js';

const app = express();

// Разрешаем frontend отправлять cookie на backend.
app.use(
  cors(
    config.app.clientOrigin
      ? { origin: config.app.clientOrigin, credentials: true }
      : undefined,
  ),
);
// Парсим JSON-тела запросов.
app.use(express.json());
// Монтируем все API-маршруты под версию.
app.use('/api/v1', routerV1);
// Отдаём 404 для неизвестных путей.
app.use(notFound);
// Ловим и форматируем ошибки.
app.use(errorHandler);

export default app;
