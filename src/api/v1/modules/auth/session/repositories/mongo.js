import { AuthSession } from '#db/models/AuthSession.js';

// Создаём отдельную запись для каждого входа.
export function createAuthSession(data, options = {}) {
  return AuthSession.create(data, { session: options.session });
}

// Ищем только действующую сессию по хэшу токена.
export function findActiveSessionByTokenHash(sessionTokenHash) {
  return AuthSession.findOne({
    sessionTokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
}

// Удаляем текущую сессию пользователя сразу после Logout.
export function deleteSessionByTokenHash(sessionTokenHash) {
  return AuthSession.deleteOne({ sessionTokenHash });
}
