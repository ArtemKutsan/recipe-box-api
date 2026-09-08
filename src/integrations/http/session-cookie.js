import config from '#config/index.js';
import { getSessionLifetimeMs } from '#api/v1/modules/auth/session/service.js';

const SESSION_COOKIE_PATH = '/';

// Достаём значение конкретной cookie из обычного заголовка Cookie.
function getCookieValue(cookieHeader, cookieName) {
  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(cookieName.length + 1));
}

// Возвращаем token текущей сессии из cookie запроса.
export function getSessionTokenFromRequest(req) {
  return getCookieValue(req.headers.cookie, config.auth.sessionCookieName);
}

// Кладём session token в cookie, чтобы браузер отправлял его сам.
export function setSessionCookie(res, sessionToken) {
  res.cookie(config.auth.sessionCookieName, sessionToken, {
    httpOnly: true, // JavaScript на frontend не сможет прочитать token.
    secure: config.auth.sessionCookieSecure, // В production cookie работает только через HTTPS.
    sameSite: config.auth.sessionCookieSameSite, // Ограничиваем отправку cookie между сайтами.
    maxAge: getSessionLifetimeMs(), // Cookie живёт столько же, сколько серверная сессия.
    path: SESSION_COOKIE_PATH, // Cookie отправляется API и Socket.IO.
  });
}

// Удаляем cookie с теми же настройками, с которыми она была создана.
export function clearSessionCookie(res) {
  res.clearCookie(config.auth.sessionCookieName, {
    httpOnly: true,
    secure: config.auth.sessionCookieSecure,
    sameSite: config.auth.sessionCookieSameSite,
    path: SESSION_COOKIE_PATH,
  });
}
