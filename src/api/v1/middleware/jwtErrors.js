// Создаём одинаковую ошибку для всех проблем с токеном авторизации.
export function buildUnauthorizedError(message) {
  const error = new Error(message);
  error.status = 401;
  error.code = 'UNAUTHORIZED';
  return error;
}

// Превращаем ошибки библиотеки jsonwebtoken в понятные ответы API со статусом 401.
export function normalizeJwtError(error) {
  if (error?.name === 'TokenExpiredError') {
    return buildUnauthorizedError('Authorization token has expired.');
  }

  if (error?.name === 'JsonWebTokenError' || error?.name === 'NotBeforeError') {
    return buildUnauthorizedError('Authorization token is invalid.');
  }

  return error;
}
