import { loginUser, registerUser } from './service.js';
import { deleteUserSession } from './session/service.js';
import {
  clearSessionCookie,
  getSessionTokenFromRequest,
  setSessionCookie,
} from './session/cookie.js';
import { validateLogin, validateRegister } from './validation.js';

export async function register(req, res, next) {
  try {
    // Сначала валидируем тело запроса, потом отдаём данные в сервис.
    validateRegister(req.body);
    // User-Agent сохраняем в сессии, чтобы знать, откуда выполнен вход.
    const { sessionToken, ...response } = await registerUser(req.body, {
      userAgent: req.get('user-agent'),
    });
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
    const { sessionToken, ...response } = await loginUser(req.body, {
      userAgent: req.get('user-agent'),
    });
    // Браузер сохранит token из Set-Cookie и будет отправлять его сам.
    setSessionCookie(res, sessionToken);

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    // Текущий пользователь уже лежит в req.user после проверки middleware.
    // Middleware уже проверяет cookie-сессию.
    return res.status(200).json({ user: req.user });
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
