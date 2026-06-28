import jwt from 'jsonwebtoken';
import env from '#config/env.js';
import { User } from '#modules/users/model.js';
import { toUserResponse } from '#modules/auth/shared/response.js';

// Проверяем JWT до входа в защищённый контроллер.
export default async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      const error = new Error('Authorization token is required.');
      error.status = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    if (!env.jwtSecret) {
      const error = new Error('JWT_SECRET is required.');
      error.status = 500;
      error.code = 'JWT_SECRET_REQUIRED';
      throw error;
    }

    const payload = jwt.verify(token, env.jwtSecret);
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
    next(error);
  }
}
