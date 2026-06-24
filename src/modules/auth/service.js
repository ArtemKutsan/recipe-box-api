import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '#config/env.js';
import { User } from '#modules/users/model.js';
import { getNextSequence } from '#shared/counters/service.js';

// Сервисный слой работает с моделью пользователя и готовит ответ для API.
export function toUserDto(user) {
  return {
    id: user._id.toString(),
    publicId: user.publicId,
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

  // Получаем публичный номер и хэшируем пароль перед сохранением.
  const publicId = await getNextSequence('users');
  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await User.create({
    publicId,
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
