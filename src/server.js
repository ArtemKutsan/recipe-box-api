import app from './app.js';
import config from './config/env.js';

// Поднимаем HTTP-сервер на порту из окружения или на дефолтном порту.
app.listen(config.port, () => {
  console.log(`recipe-box-api listening on ${config.port}`);
});
