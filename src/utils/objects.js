// Простые helpers для работы с объектами без привязки к конкретной сущности.
export function setIfDefined(target, field, value) {
  if (value !== undefined) {
    target[field] = value;
  }
}
