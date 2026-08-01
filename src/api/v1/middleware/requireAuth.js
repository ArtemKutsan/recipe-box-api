import jwt from 'jsonwebtoken';
import config from '#config/index.js';
import { User } from '#db/models/User.js';
import { toUserResponse } from '../modules/auth/response.js';
import { buildUnauthorizedError, normalizeJwtError } from './jwtErrors.js';

// Проверяем JWT до входа в защищённый контроллер.
export default async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || '';
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

    // Кладём в запрос публичного пользователя для ответа и сырой документ для сервисов.
    req.user = toUserResponse(user);
    req.authUser = user;

    next();
  } catch (error) {
    next(normalizeJwtError(error));
  }
}
