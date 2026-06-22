import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '#config/env.js';
import { User } from '#modules/users/model.js';

// Сервисный слой готовит данные для controller и работает с моделью пользователя.
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
  const email = payload.email.toLowerCase().trim();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error('Email is already in use.');
    error.status = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

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

export async function loginUser(_payload) {
  return null;
}

export async function getCurrentUser(_request) {
  return null;
}
