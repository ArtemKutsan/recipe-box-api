import { Recipe } from '../model.js';
import { buildNotFoundError, parseRecipePublicId } from '../shared/utils.js';
import { toRecipeDetailResponse } from '../shared/response.js';

// Возвращаем детальную карточку рецепта по публичному номеру.
export async function getRecipeByPublicId(recipeId, viewer = null) {
  const publicId = parseRecipePublicId(recipeId);
  const publicRecipeVisibilityFilter = { $or: [{ visibility: 'public' }, { visibility: { $exists: false } }] };
  const recipeFilter = viewer?._id
    ? { publicId, $or: [publicRecipeVisibilityFilter.$or[0], publicRecipeVisibilityFilter.$or[1], { authorId: viewer._id }] }
    : { publicId, $or: publicRecipeVisibilityFilter.$or };

  const recipe = await Recipe.findOne(recipeFilter)
    .populate('authorId', 'publicId name avatarUrl')
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
