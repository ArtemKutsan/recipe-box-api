import { DEFAULT_DB_PROVIDER, DEFAULT_DB_ENABLED } from '#config/constants.js';

// Единая точка входа для настройки базы данных.
export async function connectDb() {
  const dbEnabled = process.env.DB_ENABLED === 'true' || DEFAULT_DB_ENABLED;

  if (!dbEnabled) {
    return { enabled: false };
  }

  const provider = process.env.DB_PROVIDER || DEFAULT_DB_PROVIDER;

  if (provider === 'mongo') {
    throw new Error('Mongo provider is not implemented yet.');
  }

  throw new Error(`Unsupported DB_PROVIDER: ${provider}`);
}
