import { Recipe } from '../model.js';
import { buildNotFoundError, parseRecipePublicId } from '../shared/utils.js';
import { toRecipeDetailResponse } from '../shared/response.js';

// Возвращаем детальную карточку рецепта по публичному номеру.
export async function getRecipeByPublicId(recipeId) {
  const publicId = parseRecipePublicId(recipeId);

  const recipe = await Recipe.findOne({ publicId })
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
