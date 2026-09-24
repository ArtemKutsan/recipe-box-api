/**
 * Здесь подготавливается ссылка на картинку рецепта перед сборкой API-ответа.
 * Файл знает, как получить временную ссылку для S3, но не форматирует весь рецепт.
 * Принимает: рецепт из MongoDB с уже проверенным доступом.
 * Возвращает: тот же рецепт с готовым `thumbnailUrl`.
 */
import { createDownloadUrl } from '#modules/uploads/service.js';
import { resolveUserAvatar } from '#modules/users/api/v1/services/media.js';

// Для старой внешней ссылки ничего дополнительно не делаем.
export async function resolveRecipeThumbnail(recipe) {
  const resolvedRecipe =
    typeof recipe.toObject === 'function' ? recipe.toObject() : recipe;

  return resolvedRecipe.thumbnailKey
    ? {
        ...resolvedRecipe,
        thumbnailUrl: (await createDownloadUrl(resolvedRecipe.thumbnailKey)).downloadUrl,
      }
    : resolvedRecipe;
}

export async function resolveRecipeAuthorAvatar(recipe) {
  if (!recipe.authorId?.avatarKey) {
    return recipe;
  }

  return {
    ...recipe,
    authorId: await resolveUserAvatar(recipe.authorId),
  };
}

export async function resolveRecipeMedia(recipe) {
  const recipeWithThumbnail = await resolveRecipeThumbnail(recipe);
  return resolveRecipeAuthorAvatar(recipeWithThumbnail);
}
