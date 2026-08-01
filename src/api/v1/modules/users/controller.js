import { getCurrentUserRecipes, getPublicUserProfile, getPublicUserRecipes } from './service.js';

export async function getPublicProfile(req, res, next) {
  try {
    // Берём publicId из URL и отдаём публичный профиль.
    const result = await getPublicUserProfile(req.params.publicId);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getMyRecipes(req, res, next) {
  try {
    // Берём пользователя из requireAuth и отдаём только его рецепты.
    const result = await getCurrentUserRecipes(req.query, req.authUser);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getPublicProfileRecipes(req, res, next) {
  try {
    // Берём publicId из URL и отдаём публичные рецепты этого автора.
    const result = await getPublicUserRecipes(req.params.publicId, req.query);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
