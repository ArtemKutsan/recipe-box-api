import config from '#config/index.js';
import { User } from '#db/models/User.js';
import { findUserSession } from '../modules/auth/session/service.js';

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

// Ищем пользователя по session cookie. Если cookie нет или сессия уже недействительна, вернём null.
export async function findUserBySessionCookie(req) {
  const sessionToken = getCookieValue(req.headers.cookie, config.auth.sessionCookieName);

  if (!sessionToken) {
    return null;
  }

  const session = await findUserSession(sessionToken);

  if (!session) {
    return null;
  }

  return User.findById(session.userId);
}
