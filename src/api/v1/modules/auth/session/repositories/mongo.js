import { AuthSession } from '#db/models/AuthSession.js';

// Создаём отдельную запись для каждого входа.
export function createSession(data) {
  return AuthSession.create(data);
}

// Ищем только действующую сессию по хэшу токена.
export function findActiveSessionByTokenHash(sessionTokenHash) {
  return AuthSession.findOne({
    sessionTokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
}

// Отзываем текущую сессию пользователя.
export function revokeSessionByTokenHash(sessionTokenHash) {
  return AuthSession.updateOne(
    { sessionTokenHash, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
}
