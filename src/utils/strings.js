// Строковые helpers не знают, для какой сущности их используют.
export function normalizeSlug(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-');
}

export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
