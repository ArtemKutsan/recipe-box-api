import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '#db/models/User.js';
import { getNextSequence } from '#shared/counters/service.js';
import { toUserResponse } from './response.js';
import { createSession } from './session/service.js';

function buildEmailAlreadyExistsError() {
  const error = new Error('Email is already in use.');
  error.status = 409;
  error.code = 'EMAIL_ALREADY_EXISTS';
  return error;
}

function buildInvalidCredentialsError() {
  const error = new Error('Invalid email or password.');
  error.status = 401;
  error.code = 'INVALID_CREDENTIALS';
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

  try {
    // publicId, User и AuthSession должны сохраниться или откатиться вместе.
    const transactionResult = await mongoSession.withTransaction(async () => {
      const publicId = await getNextSequence('users', { session: mongoSession });
      const user = await User.create(
        {
          publicId,
          name: payload.name.trim(),
          email,
          passwordHash,
        },
        { session: mongoSession },
      );

      const { sessionToken } = await createSession(user._id.toString(), sessionMetadata, {
        session: mongoSession,
      });

      return { user, sessionToken };
    });

    return {
      user: toUserResponse(transactionResult.user),
      sessionToken: transactionResult.sessionToken,
    };
  } catch (error) {
    // Уникальный индекс закрывает гонку между параллельными регистрациями одного email.
    if (isDuplicateEmailError(error)) {
      throw buildEmailAlreadyExistsError();
    }

    throw error;
  } finally {
    await mongoSession.endSession();
  }
}

export async function loginUser(payload, sessionMetadata = {}) {
  // Ищем пользователя по email и сверяем пароль с хэшем из базы.
  const email = payload.email.toLowerCase().trim();
  const user = await User.findOne({ email });

  if (!user) {
    throw buildInvalidCredentialsError();
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);

  if (!isPasswordValid) {
    throw buildInvalidCredentialsError();
  }

  const { sessionToken } = await createSession(user._id.toString(), sessionMetadata);

  return {
    user: toUserResponse(user),
    sessionToken,
  };
}
