/**
 * Здесь лежат небольшие вспомогательные функции, которые нужны в нескольких файлах recipes.
 * Они собирают данные автора для ответа, читают публичный номер рецепта из URL
 * и создают типовые ошибки recipes.
 * Эти функции ничего не ищут и не сохраняют в базе данных.
 * Принимает: рецепт, автора или номер рецепта из URL `'42'`.
 * Возвращает: данные автора или выбрасывает типовую ошибку recipes.
 */
// Возвращаем только публичные данные автора рецепта.
export function toRecipeAuthorResponse(author) {
  if (!author) {
    return null;
  }

  return {
    id: author.publicId ?? author.id ?? author._id?.toString(),
    name: author.name,
    avatarUrl: author.avatarUrl ?? null,
  };
}

// Превращаем id из URL в публичный номер рецепта.
export function parseRecipePublicId(value) {
  const publicId = Number(value);

  if (!Number.isInteger(publicId) || publicId < 1) {
    buildNotFoundError('Recipe not found.', 'RECIPE_NOT_FOUND');
  }

  return publicId;
}

// Формируем ошибку с HTTP-статусом и внутренним кодом в одном месте.
export function buildNotFoundError(message, code) {
  const error = new Error(message);
  error.status = 404;
  error.code = code;
  throw error;
}
