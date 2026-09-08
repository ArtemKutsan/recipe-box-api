import { createHash, randomBytes } from 'node:crypto';
import config from '#config/index.js';
import {
  createAuthSession,
  deleteSessionByTokenHash,
  findActiveSessionByTokenHash,
} from './repositories/index.js';
import { findUserById } from '#modules/users/repositories/index.js';

// Нужен, чтобы задавать срок сессии в env как 30d и получать дату её окончания.
function parseSessionLifetime(value) {
  // В env срок приходит строкой вроде 30d, поэтому отделяем число от единицы времени.
  const match = /^([1-9]\d*)([smhd])$/.exec(value);

  if (!match) {
    const error = new Error('SESSION_EXPIRES_IN must look like 30d, 12h, 45m or 30s.');
    error.status = 500;
    error.code = 'SESSION_EXPIRES_IN_INVALID';
    throw error;
  }

  // Переводим секунды, минуты, часы и дни в миллисекунды для расчёта даты.
  const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return Number(match[1]) * units[match[2]];
}

// Возвращаем срок в миллисекундах для cookie и даты сессии.
export function getSessionLifetimeMs() {
  return parseSessionLifetime(config.auth.sessionExpiresIn);
}

// Превращаем token в хэш для хранения и поиска в базе.
export function hashSessionToken(sessionToken) {
  return createHash('sha256').update(sessionToken).digest('hex');
}

// Создаём случайный token и сохраняем только его хэш.
export async function createSession(userId, sessionMetadata = {}, options = {}) {
  const sessionToken = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + getSessionLifetimeMs());

  const authSession = await createAuthSession({
    userId,
    sessionTokenHash: hashSessionToken(sessionToken),
    expiresAt,
    userAgent: sessionMetadata.userAgent || null,
  }, options);

  return { sessionToken, authSession };
}

// Ищем действующую сессию по token из cookie.
export function findUserSession(sessionToken) {
  if (!sessionToken) {
    return null;
  }

  return findActiveSessionByTokenHash(hashSessionToken(sessionToken));
}

// По token находим AuthSession и связанного с ней пользователя.
export async function findUserBySessionToken(sessionToken) {
  if (!sessionToken) {
    return null;
  }

  const authSession = await findUserSession(sessionToken);

  if (!authSession) {
    return null;
  }

  return findUserById(authSession.userId);
}

// Удаляем сессию по token из cookie.
export function deleteUserSession(sessionToken) {
  if (!sessionToken) {
    return null;
  }

  return deleteSessionByTokenHash(hashSessionToken(sessionToken));
}
