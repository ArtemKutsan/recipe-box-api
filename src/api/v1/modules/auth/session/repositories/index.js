import config from '#config/index.js';
import * as mongoRepository from './mongo.js';

const repositories = {
  mongo: mongoRepository,
};

const repository = repositories[config.auth.sessionStore];

if (!repository) {
  const error = new Error(`Unsupported session store: ${config.auth.sessionStore}`);
  error.status = 500;
  error.code = 'SESSION_STORE_UNSUPPORTED';
  throw error;
}

// Выбираем хранилище сессий через одну настройку.
export const createSession = repository.createSession;
export const findActiveSessionByTokenHash = repository.findActiveSessionByTokenHash;
export const revokeSessionByTokenHash = repository.revokeSessionByTokenHash;
