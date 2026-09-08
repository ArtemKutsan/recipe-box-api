/**
 * Здесь подготавливается ссылка на картинку рецепта перед сборкой API-ответа.
 * Файл знает, как получить временную ссылку для S3, но не форматирует весь рецепт.
 * Принимает: рецепт из MongoDB с уже проверенным доступом.
 * Возвращает: тот же рецепт с готовым `thumbnailUrl`.
 */
import { createDownloadUrl } from '#modules/uploads/service.js';
import { resolveUserAvatar } from '#modules/users/api/v1/media.js';

// Для старой внешней ссылки ничего дополнительно не делаем.
export async function resolveRecipeThumbnail(recipe) {
  const resolvedRecipe = recipe.thumbnailKey
    ? {
        ...recipe,
        thumbnailUrl: (await createDownloadUrl(recipe.thumbnailKey)).downloadUrl,
      }
    : recipe;

  if (!resolvedRecipe.authorId?.avatarKey) {
    return resolvedRecipe;
  }

  return {
    ...resolvedRecipe,
    authorId: await resolveUserAvatar(resolvedRecipe.authorId),
  };
}
