import {
  addFavorite,
  getCurrentUserFavoriteRecipes,
  getCurrentUserFavorites,
  removeFavorite,
} from './service.js';

export async function list(req, res, next) {
  try {
    const result = await getCurrentUserFavorites(req.authUser);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function listRecipes(req, res, next) {
  try {
    const result = await getCurrentUserFavoriteRecipes(req.query, req.authUser);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function add(req, res, next) {
  try {
    const result = await addFavorite(req.params.recipeId, req.authUser);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await removeFavorite(req.params.recipeId, req.authUser);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
