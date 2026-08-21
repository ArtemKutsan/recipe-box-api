import { getRecipesByAuthor } from '../recipes/service.js';
import { toPublicUserResponse } from './response.js';
import { findUserByPublicId } from './repositories/index.js';

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

export async function getPublicUserProfile(publicId) {
  const user = await getUserByPublicId(publicId);

  return {
    user: toPublicUserResponse(user),
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
