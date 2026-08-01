import mongoose from 'mongoose';
import config from '#config/index.js';

// Подключаем MongoDB только тогда, когда база действительно включена.
export async function connectMongo() {
  if (!config.db.mongoUri) {
    throw new Error('MONGODB_URI is required when DB_ENABLED is true.');
  }

  await mongoose.connect(config.db.mongoUri);

  return {
    enabled: true,
    provider: 'mongo',
  };
}
