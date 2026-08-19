import { toUserResponse } from '../../modules/auth/response.js';
import { findUserBySessionCookie } from './session.js';

// Пытаемся найти session cookie, но не ломаем публичный запрос без авторизации.
export default async function optionalAuth(req, _res, next) {
  try {
    const sessionUser = await findUserBySessionCookie(req);

    if (!sessionUser) {
      return next();
    }

    req.user = toUserResponse(sessionUser);
    req.authUser = sessionUser;

    return next();
  } catch (error) {
    return next(error);
  }
}
