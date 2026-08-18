import config from '#config/index.js';
import { loginUser, registerUser } from './service.js';
import { getSessionLifetimeMs } from './session/service.js';
import { validateLogin, validateRegister } from './validation.js';

// Кладём session token в cookie, чтобы браузер отправлял его сам.
function setSessionCookie(res, sessionToken) {
  res.cookie(config.auth.sessionCookieName, sessionToken, {
    httpOnly: true, // JavaScript на frontend не сможет прочитать token.
    secure: config.auth.sessionCookieSecure, // В production cookie работает только через HTTPS.
    sameSite: config.auth.sessionCookieSameSite, // Ограничиваем отправку cookie между сайтами.
    maxAge: getSessionLifetimeMs(), // Cookie живёт столько же, сколько серверная сессия.
    path: '/api/v1', // Cookie отправляется только API-маршрутам.
  });
}

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
    // Пока middleware проверяет JWT; позже здесь будет работать cookie-сессия.
    return res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
}
