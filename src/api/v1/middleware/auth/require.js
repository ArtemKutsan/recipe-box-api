import { toUserResponse } from '#modules/auth/api/v1/response.js';
import { getSessionTokenFromRequest } from '#integrations/http/session-cookie.js';
import { findUserBySessionToken } from '#modules/auth/session/service.js';
import { resolveUserAvatar } from '../../modules/users/media.js';

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

    // Кладём в запрос публичного пользователя для ответа и сырой документ для сервисов.
    req.user = toUserResponse(await resolveUserAvatar(sessionUser));
    req.authUser = sessionUser;

    return next();
  } catch (error) {
    return next(error);
  }
}
