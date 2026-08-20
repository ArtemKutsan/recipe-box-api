import { AuthSession } from '#db/models/AuthSession.js';

// Создаём отдельную запись для каждого входа.
export async function createSession(data, options = {}) {
  const [session] = await AuthSession.create([data], { session: options.session });
  return session;
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
