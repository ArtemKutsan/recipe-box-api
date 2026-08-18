import { Schema, model } from 'mongoose';

const { ObjectId } = Schema.Types;

// Одна запись — одна сессия пользователя.
const authSessionSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    // Храним хэш, а не сам токен из cookie.
    sessionTokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    // Заполняем при досрочном завершении сессии.
    revokedAt: {
      type: Date,
      default: null,
    },
    // Информация о браузере и устройстве.
    userAgent: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Индекс для быстрого получения сессий пользователя от новых к старым.
authSessionSchema.index({ userId: 1, createdAt: -1 });
// Индекс для быстрого поиска сессии по хэшу токена.
authSessionSchema.index({ sessionTokenHash: 1 }, { unique: true });
// TTL удаляет истёкшие сессии, но срок всё равно проверяем в сервисе.
authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AuthSession = model('AuthSession', authSessionSchema, 'authSessions');
