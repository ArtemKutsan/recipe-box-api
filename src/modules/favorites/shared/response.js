import { toRecipeListResponse } from '#modules/recipes/shared/response.js';

// Возвращаем состояние одной связи после сохранения или удаления.
export function toFavoriteStateResponse(recipeId, isFavorite, savedAt = null) {
  const response = {
    recipeId,
    isFavorite,
  };

  if (savedAt) {
    response.savedAt = savedAt;
  }

  return response;
}

// Добавляем к обычной карточке рецепта данные личного сохранения.
export function toFavoriteRecipeResponse(recipe, savedAt) {
  return {
    ...toRecipeListResponse(recipe),
    isFavorite: true,
    savedAt,
  };
}
