import { Schema } from 'mongoose';

// Схема пользователя хранит только данные, нужные для авторизации и профиля.
// Дополнительные публичные поля профиля храним здесь же, чтобы не тащить DummyJSON-структуру.
export const userSchema = new Schema(
  {
    publicId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    age: {
      type: Number,
      default: null,
      min: 0,
    },
    gender: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);
