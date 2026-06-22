import mongoose from 'mongoose';
import env from '#config/env.js';

// Подключаем MongoDB только тогда, когда база действительно включена.
export async function connectMongo() {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is required when DB_ENABLED is true.');
  }

  await mongoose.connect(env.mongoUri);

  return {
    enabled: true,
    provider: 'mongo',
  };
}
