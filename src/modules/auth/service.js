import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '#config/env.js';
import { User } from '#modules/users/model.js';

// Сервисный слой работает с моделью пользователя и готовит ответ для API.
function toUserDto(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt,
  };
}

// Подписываем JWT тем секретом, который хранится в окружении сервера.
function createToken(userId) {
  if (!env.jwtSecret) {
    const error = new Error('JWT_SECRET is required.');
    error.status = 500;
    error.code = 'JWT_SECRET_REQUIRED';
    throw error;
  }

  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: '7d' });
}

// Достаём bearer-токен из заголовка Authorization.
function getTokenFromRequest(request) {
  const authHeader = request.headers.authorization || '';
  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    const error = new Error('Authorization token is required.');
    error.status = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  return token;
}

// Проверяем токен и получаем payload с id пользователя.
function verifyToken(token) {
  if (!env.jwtSecret) {
    const error = new Error('JWT_SECRET is required.');
    error.status = 500;
    error.code = 'JWT_SECRET_REQUIRED';
    throw error;
  }

  return jwt.verify(token, env.jwtSecret);
}

export async function registerUser(payload) {
  // Нормализуем email и проверяем, что такой пользователь ещё не существует.
  const email = payload.email.toLowerCase().trim();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error('Email is already in use.');
    error.status = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  // Хэшируем пароль и сохраняем его хеш в базе.
  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await User.create({
    name: payload.name.trim(),
    email,
    passwordHash,
  });

  return {
    user: toUserDto(user),
    token: createToken(user._id.toString()),
  };
}

export async function loginUser(payload) {
  // Ищем пользователя по email и сверяем пароль с хэшем из базы.
  const email = payload.email.toLowerCase().trim();
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  return {
    user: toUserDto(user),
    token: createToken(user._id.toString()),
  };
}

export async function getCurrentUser(request) {
  // Из токена берём id пользователя и загружаем его из MongoDB.
  const token = getTokenFromRequest(request);
  const payload = verifyToken(token);
  const user = await User.findById(payload.sub);

  if (!user) {
    const error = new Error('User not found.');
    error.status = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  return {
    user: toUserDto(user),
  };
}
