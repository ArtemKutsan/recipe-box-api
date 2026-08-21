import { getRecipesByAuthor } from '../recipes/service.js';
import { toPublicUserResponse } from './response.js';
import { findUserByPublicId, updateUserAvatar } from './repositories/index.js';
import { resolveUserAvatar } from './media.js';
import { validateMediaFileKey } from '../uploads/validation.js';
import { deleteMediaObject } from '../uploads/service.js';

function buildUserNotFoundError() {
  const error = new Error('User not found.');
  error.status = 404;
  error.code = 'USER_NOT_FOUND';
  return error;
}

async function getUserByPublicId(publicId) {
  const userPublicId = Number(publicId);

  // Если publicId не число, профиль не ищем.
  if (!Number.isInteger(userPublicId) || userPublicId < 1) {
    throw buildUserNotFoundError();
  }

  const user = await findUserByPublicId(userPublicId);

  if (!user) {
    throw buildUserNotFoundError();
  }

  return user;
}

function getAvatarKey(userId, avatarKey) {
  const normalizedKey = validateMediaFileKey(avatarKey);
  const ownerFolder = `avatars/${userId.toString()}/`;

  if (!normalizedKey.startsWith(ownerFolder)) {
    const error = new Error('avatarKey must belong to the current user.');
    error.status = 403;
    error.code = 'MEDIA_ACCESS_DENIED';
    throw error;
  }

  return normalizedKey;
}

export async function getPublicUserProfile(publicId) {
  const user = await resolveUserAvatar(await getUserByPublicId(publicId));

  return {
    user: toPublicUserResponse(user),
  };
}

export async function updateCurrentUserAvatar(user, avatarKey) {
  const normalizedKey = getAvatarKey(user._id, avatarKey);
  const updatedUser = await updateUserAvatar(user._id, normalizedKey);

  if (user.avatarKey && user.avatarKey !== normalizedKey) {
    await deleteMediaObject(user.avatarKey);
  }

  return {
    user: toPublicUserResponse(await resolveUserAvatar(updatedUser)),
  };
}

export async function getPublicUserRecipes(publicId, query = {}) {
  const user = await getUserByPublicId(publicId);

  // Публичный список рецептов автора использует тот же recipes service.
  return getRecipesByAuthor(user._id, query);
}

export async function getCurrentUserRecipes(query = {}, user) {
  // Рецепты текущего пользователя включают и public, и private записи.
  return getRecipesByAuthor(user._id, query, { includePrivate: true });
}
