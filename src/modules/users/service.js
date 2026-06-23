import { isValidObjectId } from 'mongoose';
import { User } from './model.js';

// Сервис users готовит публичный профиль пользователя.
function toPublicProfileDto(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
  };
}

export async function getPublicUserProfile(userId) {
  // Если id не похож на Mongo ObjectId, профиль не ищем.
  if (!isValidObjectId(userId)) {
    const error = new Error('User not found.');
    error.status = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found.');
    error.status = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  return {
    user: toPublicProfileDto(user),
  };
}
