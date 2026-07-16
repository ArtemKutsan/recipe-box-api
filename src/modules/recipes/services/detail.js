/**
 * Здесь загружается один рецепт для страницы с его подробностями.
 * Файл получает публичный номер рецепта из URL, проверяет, можно ли его показать
 * незалогиненному пользователю или владельцу, и добавляет данные автора, кухни и типов питания.
 * Затем он возвращает готовый объект рецепта для фронтенда.
 * Принимает: номер из URL, например `'42'`, и пользователя из JWT или `null`.
 * Возвращает: `{ recipe: {...} }` с полными данными одного рецепта.
 * Пример: `getRecipeByPublicId('42', null)` для незалогиненного пользователя.
 */
import { Recipe } from '../model.js';
import { buildNotFoundError, parseRecipePublicId } from '../shared/utils.js';
import { toRecipeDetailResponse } from '../shared/response.js';

// Возвращаем детальную карточку рецепта по публичному номеру.
export async function getRecipeByPublicId(recipeId, currentUser = null) {
  const publicId = parseRecipePublicId(recipeId);
  const publicRecipeVisibilityFilter = { $or: [{ visibility: 'public' }, { visibility: { $exists: false } }] };
  const recipeFilter = currentUser?._id
    ? { publicId, $or: [publicRecipeVisibilityFilter.$or[0], publicRecipeVisibilityFilter.$or[1], { authorId: currentUser._id }] }
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
