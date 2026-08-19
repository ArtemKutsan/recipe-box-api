import { toUserResponse } from '../../modules/auth/response.js';
import { findUserBySessionCookie } from './session.js';

function buildUnauthorizedError() {
  const error = new Error('Authentication is required.');
  error.status = 401;
  error.code = 'UNAUTHORIZED';
  return error;
}

// Проверяем session cookie до входа в защищённый контроллер.
export default async function requireAuth(req, _res, next) {
  try {
    const sessionUser = await findUserBySessionCookie(req);

    if (!sessionUser) {
      throw buildUnauthorizedError();
    }

    // Кладём в запрос публичного пользователя для ответа и сырой документ для сервисов.
    req.user = toUserResponse(sessionUser);
    req.authUser = sessionUser;

    return next();
  } catch (error) {
    return next(error);
  }
}
