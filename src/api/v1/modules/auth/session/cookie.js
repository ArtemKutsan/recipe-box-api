import config from '#config/index.js';
import { getSessionLifetimeMs } from './service.js';

// Кладём session token в cookie, чтобы браузер отправлял его сам.
export function setSessionCookie(res, sessionToken) {
  res.cookie(config.auth.sessionCookieName, sessionToken, {
    httpOnly: true, // JavaScript на frontend не сможет прочитать token.
    secure: config.auth.sessionCookieSecure, // В production cookie работает только через HTTPS.
    sameSite: config.auth.sessionCookieSameSite, // Ограничиваем отправку cookie между сайтами.
    maxAge: getSessionLifetimeMs(), // Cookie живёт столько же, сколько серверная сессия.
    path: '/api/v1', // Cookie отправляется только API-маршрутам.
  });
}

// Удаляем cookie с теми же настройками, с которыми она была создана.
export function clearSessionCookie(res) {
  res.clearCookie(config.auth.sessionCookieName, {
    httpOnly: true,
    secure: config.auth.sessionCookieSecure,
    sameSite: config.auth.sessionCookieSameSite,
    path: '/api/v1',
  });
}
