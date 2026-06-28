import mongoose from 'mongoose';
import { Recipe } from '../model.js';
import { buildNotFoundError } from '../shared/utils.js';
import { toRecipeDetailResponse } from '../shared/response.js';

// Возвращаем детальную карточку рецепта по Mongo id.
export async function getRecipeById(recipeId) {
  if (!mongoose.isValidObjectId(recipeId)) {
    buildNotFoundError('Recipe not found.', 'RECIPE_NOT_FOUND');
  }

  const recipe = await Recipe.findById(recipeId)
    .populate('authorId', 'publicId name')
    .populate('mealTypeIds', 'title')
    .populate('cuisineId', 'title')
    .lean();

  if (!recipe) {
    buildNotFoundError('Recipe not found.', 'RECIPE_NOT_FOUND');
  }

  return {
    recipe: toRecipeDetailResponse(recipe),
  };
}
