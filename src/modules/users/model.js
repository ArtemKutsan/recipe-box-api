import { model } from 'mongoose';
import { userSchema } from './schema.js';

// Модель пользователя нужна сервисам auth и профиля.
export const User = model('User', userSchema);
