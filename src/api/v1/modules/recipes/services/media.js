/**
 * Здесь подготавливается ссылка на картинку рецепта перед сборкой API-ответа.
 * Файл знает, как получить временную ссылку для S3, но не форматирует весь рецепт.
 * Принимает: рецепт из MongoDB с уже проверенным доступом.
 * Возвращает: тот же рецепт с готовым `thumbnailUrl`.
 */
import { createDownloadUrl } from '../../uploads/service.js';

// Для старой внешней ссылки ничего дополнительно не делаем.
export async function resolveRecipeThumbnail(recipe) {
  if (!recipe.thumbnailKey) {
    return recipe;
  }

  const { downloadUrl } = await createDownloadUrl(recipe.thumbnailKey);

  return {
    ...recipe,
    thumbnailUrl: downloadUrl,
  };
}
