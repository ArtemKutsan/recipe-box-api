import { toUserResponse } from '#modules/auth/api/v1/response.js';
import { getSessionTokenFromRequest } from '#integrations/http/session-cookie.js';
import { findUserBySessionToken } from '#modules/auth/session/service.js';
import { resolveUserAvatar } from '#modules/users/api/v1/media.js';

// Пытаемся найти session cookie, но не ломаем публичный запрос без авторизации.
export default async function optionalAuth(req, _res, next) {
  try {
    const sessionToken = getSessionTokenFromRequest(req);
    const sessionUser = await findUserBySessionToken(sessionToken);

    if (!sessionUser) {
      return next();
    }

    req.user = toUserResponse(await resolveUserAvatar(sessionUser));
    req.authUser = sessionUser;

    return next();
  } catch (error) {
    return next(error);
  }
}
