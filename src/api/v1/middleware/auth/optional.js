import jwt from 'jsonwebtoken';
import config from '#config/index.js';
import { User } from '#db/models/User.js';
import { toUserResponse } from '../../modules/auth/response.js';
import { findUserBySessionCookie } from './session.js';
import { buildUnauthorizedError, normalizeJwtError } from './jwtErrors.js';

// Пытаемся распознать JWT, но не ломаем публичный запрос, если токена нет.
export default async function optionalAuth(req, _res, next) {
  try {
    // Если есть действующая cookie-сессия, добавляем пользователя в запрос.
    const sessionUser = await findUserBySessionCookie(req);

    if (sessionUser) {
      req.user = toUserResponse(sessionUser);
      req.authUser = sessionUser;
      return next();
    }

    // JWT оставляем как временный вариант для старого frontend.
    const authHeader = req.headers.authorization || '';

    if (!authHeader) {
      return next();
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw buildUnauthorizedError('Authorization token is required.');
    }

    if (!config.auth.jwtSecret) {
      const error = new Error('JWT_SECRET is required.');
      error.status = 500;
      error.code = 'JWT_SECRET_REQUIRED';
      throw error;
    }

    const payload = jwt.verify(token, config.auth.jwtSecret);
    const user = await User.findById(payload.sub);

    if (!user) {
      const error = new Error('User not found.');
      error.status = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    req.user = toUserResponse(user);
    req.authUser = user;

    next();
  } catch (error) {
    next(normalizeJwtError(error));
  }
}
