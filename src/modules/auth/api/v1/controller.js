import { loginUser, registerUser } from '#modules/auth/service.js';
import { deleteUserSession } from '#modules/auth/session/service.js';
import {
  clearSessionCookie,
  getSessionTokenFromRequest,
  setSessionCookie,
} from '#integrations/http/session-cookie.js';
import { toUserResponse } from './response.js';
import { validateLogin, validateRegister } from './validation.js';
import { resolveUserAvatar } from '#modules/users/api/v1/media.js';

export async function register(req, res, next) {
  try {
    // Сначала валидируем тело запроса, потом отдаём данные в сервис.
    validateRegister(req.body);
    // User-Agent сохраняем в сессии, чтобы знать, откуда выполнен вход.
    const { sessionToken, user } = await registerUser(req.body, {
      userAgent: req.get('user-agent'),
    });
    const response = { user: toUserResponse(await resolveUserAvatar(user)) };
    // Token нужен только для cookie и не должен попасть в JSON-ответ.
    setSessionCookie(res, sessionToken);

    return res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    // Логин идёт по той же схеме: проверка тела запроса и потом сервис.
    validateLogin(req.body);
    // User-Agent относится к текущему входу, а не к данным пользователя.
    const { sessionToken, user } = await loginUser(req.body, {
      userAgent: req.get('user-agent'),
    });
    const response = { user: toUserResponse(await resolveUserAvatar(user)) };
    // Браузер сохранит token из Set-Cookie и будет отправлять его сам.
    setSessionCookie(res, sessionToken);

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    // Middleware проверяет cookie-сессию, а v1-контроллер формирует свой DTO.
    return res.status(200).json({
      user: toUserResponse(await resolveUserAvatar(req.authUser)),
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    // Удаляем только текущую сессию, а не все входы пользователя.
    await deleteUserSession(getSessionTokenFromRequest(req));
    clearSessionCookie(res);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
