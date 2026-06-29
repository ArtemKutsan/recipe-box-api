import { RECIPE_DIFFICULTIES, RECIPE_DIFFICULTY_ERROR } from './constants.js';

const RECIPE_UPDATE_FIELDS = [
  'title',
  'description',
  'mealType',
  'cuisine',
  'tags',
  'ingredients',
  'instructions',
  'prepTimeMinutes',
  'cookTimeMinutes',
  'servings',
  'difficulty',
  'images',
  'thumbnailUrl',
];

// Общий helper для ошибок валидации рецепта.
function throwValidationError(errors) {
  const error = new Error('Validation failed');
  error.status = 400;
  error.code = 'VALIDATION_ERROR';
  error.details = errors;
  throw error;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function validateRecipeFields(body, errors, { partial = false } = {}) {
  if ((!partial || body.title !== undefined) && (!isNonEmptyString(body.title) || body.title.trim().length < 3)) {
    errors.push('title must be at least 3 characters long');
  }

  if ((!partial || body.mealType !== undefined) && (!isStringArray(body.mealType) || body.mealType.length === 0)) {
    errors.push('mealType must be a non-empty array of strings');
  }

  if ((!partial || body.cuisine !== undefined) && !isNonEmptyString(body.cuisine)) {
    errors.push('cuisine must be a non-empty string');
  }

  if (
    (!partial || body.ingredients !== undefined) &&
    (!isStringArray(body.ingredients) || body.ingredients.length === 0)
  ) {
    errors.push('ingredients must be a non-empty array of strings');
  }

  if (
    (!partial || body.instructions !== undefined) &&
    (!isStringArray(body.instructions) || body.instructions.length === 0)
  ) {
    errors.push('instructions must be a non-empty array of strings');
  }

  if (body.tags !== undefined && !isStringArray(body.tags)) {
    errors.push('tags must be an array of strings');
  }

  if (body.images !== undefined && !isStringArray(body.images)) {
    errors.push('images must be an array of strings');
  }

  if (
    (!partial || body.prepTimeMinutes !== undefined) &&
    (!Number.isFinite(Number(body.prepTimeMinutes)) || Number(body.prepTimeMinutes) < 0)
  ) {
    errors.push('prepTimeMinutes must be a non-negative number');
  }

  if (
    (!partial || body.cookTimeMinutes !== undefined) &&
    (!Number.isFinite(Number(body.cookTimeMinutes)) || Number(body.cookTimeMinutes) < 0)
  ) {
    errors.push('cookTimeMinutes must be a non-negative number');
  }

  if (
    (!partial || body.servings !== undefined) &&
    (!Number.isFinite(Number(body.servings)) || Number(body.servings) < 1)
  ) {
    errors.push('servings must be a positive number');
  }

  if (body.difficulty !== undefined) {
    const normalizedDifficulty = String(body.difficulty).trim().toLowerCase();

    if (!RECIPE_DIFFICULTIES.includes(normalizedDifficulty)) {
      errors.push(RECIPE_DIFFICULTY_ERROR);
    }
  }
}

// Проверяем тело запроса для создания рецепта.
export function validateCreateRecipe(payload) {
  const body = payload || {};
  const errors = [];

  validateRecipeFields(body, errors);

  if (errors.length > 0) {
    throwValidationError(errors);
  }

  return [];
}

// Проверяем тело запроса для частичного обновления рецепта.
export function validateUpdateRecipe(payload) {
  const body = payload || {};
  const errors = [];
  const bodyFields = Object.keys(body);
  const supportedFields = bodyFields.filter((field) => RECIPE_UPDATE_FIELDS.includes(field));
  const unsupportedFields = bodyFields.filter((field) => !RECIPE_UPDATE_FIELDS.includes(field));

  if (supportedFields.length === 0) {
    errors.push('request body must include at least one field');
  }

  if (unsupportedFields.length > 0) {
    errors.push(`unsupported fields: ${unsupportedFields.join(', ')}`);
  }

  validateRecipeFields(body, errors, { partial: true });

  if (errors.length > 0) {
    throwValidationError(errors);
  }

  return [];
}
