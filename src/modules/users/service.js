import { User } from './model.js';

// Сервис users готовит публичный профиль пользователя.
function toPublicProfileDto(user) {
  return {
    id: user.publicId,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
  };
}

export async function getPublicUserProfile(publicId) {
  const userPublicId = Number(publicId);

  // Если publicId не число, профиль не ищем.
  if (!Number.isInteger(userPublicId) || userPublicId < 1) {
    const error = new Error('User not found.');
    error.status = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const user = await User.findOne({ publicId: userPublicId });

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
