import { AuthSession } from '#db/models/AuthSession.js';

// Создаём отдельную запись для каждого входа.
export async function createAuthSession(data, options = {}) {
  // AuthSession.create() поддерживает два варианта:
  // AuthSession.create(doc) и несколько документов:
  // AuthSession.create(doc1, doc2, doc3).
  // Поэтому AuthSession.create(data, { session: options.session }) не означает
  // автоматически: создай data, а второй объект используй как options.
  // Mongoose может понять это как создание двух документов: data и
  // { session: options.session }. Тогда session проверяется как поле
  // AuthSession, и возникают ошибки валидации.
  //
  // Массив нужен, чтобы убрать эту неоднозначность:
  // const [authSession] = await AuthSession.create(
  //   [data],
  //   { session: options.session },
  // );
  // Первый аргумент-массив - документы, второй аргумент - options.
  // Это особенность API Mongoose Model.create(), а не правило MongoDB
  // и не отдельное требование транзакций.
  // Для одной записи save() понятнее: data точно документ, а session
  // точно настройка сохранения.
  const authSession = new AuthSession(data);

  await authSession.save({ session: options.session });

  return authSession;
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
