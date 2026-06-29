import { User } from './model.js';
import { getRecipesByAuthor } from '#modules/recipes/service.js';
import { toPublicUserResponse } from './shared/response.js';

async function findUserByPublicId(publicId) {
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

  return user;
}

export async function getPublicUserProfile(publicId) {
  const user = await findUserByPublicId(publicId);

  return {
    user: toPublicUserResponse(user),
  };
}

export async function getPublicUserRecipes(publicId, query = {}) {
  const user = await findUserByPublicId(publicId);

  // Публичный список рецептов автора использует тот же recipes service.
  return getRecipesByAuthor(user._id, query);
}

export async function getCurrentUserRecipes(query = {}, user) {
  // Рецепты отдаёт recipes module, users module только задаёт текущего автора.
  return getRecipesByAuthor(user._id, query);
}
