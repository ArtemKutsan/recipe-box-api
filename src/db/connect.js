import config from '#config/index.js';
import { connectMongo } from '#db/providers/mongo.js';

// Единая точка входа для настройки базы данных.
export async function connectDb() {
  if (!config.db.enabled) {
    return { enabled: false };
  }

  if (config.db.provider === 'mongo') {
    return connectMongo();
  }

  throw new Error(`Unsupported DB_PROVIDER: ${config.db.provider}`);
}
