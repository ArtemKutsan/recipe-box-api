import { getSessionTokenFromRequest } from '#integrations/http/session-cookie.js';
import { findUserBySessionToken } from '#modules/auth/session/service.js';

function buildUnauthorizedError() {
  const error = new Error('Authentication is required.');
  error.status = 401;
  error.code = 'UNAUTHORIZED';
  return error;
}

// Проверяем session cookie до входа в защищённый контроллер.
export default async function requireAuth(req, _res, next) {
  try {
    const sessionToken = getSessionTokenFromRequest(req);
    const sessionUser = await findUserBySessionToken(sessionToken);

    if (!sessionUser) {
      throw buildUnauthorizedError();
    }

    // Передаём дальше сырого пользователя; HTTP-ответ формирует конкретная версия API.
    req.authUser = sessionUser;

    return next();
  } catch (error) {
    return next(error);
  }
}
