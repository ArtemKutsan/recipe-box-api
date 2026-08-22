// Работаем с массивами строк одинаково во всех модулях.
export function normalizeStringArray(value = []) {
  return value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
}

export function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}
