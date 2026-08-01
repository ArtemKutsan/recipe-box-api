import jwt from 'jsonwebtoken';
import config from '#config/index.js';
import { User } from '#db/models/User.js';
import { toUserResponse } from '#modules/auth/shared/response.js';

// Пытаемся распознать JWT, но не ломаем публичный запрос, если токена нет.
export default async function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader) {
      return next();
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      const error = new Error('Authorization token is required.');
      error.status = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
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
    next(error);
  }
}
