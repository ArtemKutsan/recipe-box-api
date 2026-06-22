import app from './app.js';
import config from '#config/env.js';
import { connectDb } from '#db/connect.js';

try {
  // Сначала пробуем поднять базу, если она включена в окружении.
  const dbState = await connectDb();

  if (!dbState.enabled) {
    console.log('Database is not connected, server is running without DB.');
  }
} catch (error) {
  console.error('Database connection failed:');
  console.error(error.message);
  process.exit(1);
}

// Поднимаем HTTP-сервер на порту из окружения или на дефолтном порту.
app.listen(config.port, () => {
  console.log(`recipe-box-api listening on ${config.port}`);
});
