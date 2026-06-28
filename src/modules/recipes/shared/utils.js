// Общие утилиты рецептов используются в create, list и detail сценариях.
export function normalizeSlug(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-');
}

// Убираем пустые элементы и лишние пробелы из массивов строк.
export function normalizeStringArray(value = []) {
  return value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
}

// Возвращаем только публичные данные автора рецепта.
export function toRecipeAuthorResponse(author) {
  if (!author) {
    return null;
  }

  return {
    id: author.publicId ?? author.id ?? author._id?.toString(),
    name: author.name,
  };
}

// Формируем ошибку с HTTP-статусом и внутренним кодом в одном месте.
export function buildNotFoundError(message, code) {
  const error = new Error(message);
  error.status = 404;
  error.code = code;
  throw error;
}
