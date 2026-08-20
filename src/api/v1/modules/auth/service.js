import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '#db/models/User.js';
import { getNextSequence } from '#shared/counters/service.js';
import { toUserResponse } from './response.js';
import { createUserSession } from './session/service.js';

function buildEmailAlreadyExistsError() {
  const error = new Error('Email is already in use.');
  error.status = 409;
  error.code = 'EMAIL_ALREADY_EXISTS';
  return error;
}

function isDuplicateEmailError(error) {
  return error?.code === 11000 && Boolean(error?.keyPattern?.email || error?.keyValue?.email);
}

export async function registerUser(payload, sessionMetadata = {}) {
  // Нормализуем email и проверяем, что такой пользователь ещё не существует.
  const email = payload.email.toLowerCase().trim();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw buildEmailAlreadyExistsError();
  }

  // Хэшируем пароль до транзакции, чтобы не держать её открытой во время bcrypt.
  const passwordHash = await bcrypt.hash(payload.password, 10);
  const mongoSession = await mongoose.startSession();
  let user;
  let sessionToken;

  try {
    await mongoSession.withTransaction(async () => {
      // publicId, User и AuthSession должны сохраниться или откатиться вместе.
      const publicId = await getNextSequence('users', { session: mongoSession });
      [user] = await User.create(
        [
          {
            publicId,
            name: payload.name.trim(),
            email,
            passwordHash,
          },
        ],
        { session: mongoSession },
      );

      ({ sessionToken } = await createUserSession(
        user._id.toString(),
        sessionMetadata,
        { session: mongoSession },
      ));
    });
  } catch (error) {
    // Уникальный индекс закрывает гонку между параллельными регистрациями одного email.
    if (isDuplicateEmailError(error)) {
      throw buildEmailAlreadyExistsError();
    }

    throw error;
  } finally {
    await mongoSession.endSession();
  }

  return {
    user: toUserResponse(user),
    sessionToken,
  };
}

export async function loginUser(payload, sessionMetadata = {}) {
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

  const { sessionToken } = await createUserSession(user._id.toString(), sessionMetadata);

  return {
    user: toUserResponse(user),
    sessionToken,
  };
}
