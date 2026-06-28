import { MealType } from '#modules/meal-types/model.js';
import { Cuisine } from '#modules/cuisines/model.js';
import {
  RECIPE_LIST_DEFAULT_PAGE,
  RECIPE_LIST_DEFAULT_PAGE_SIZE,
  RECIPE_LIST_MAX_PAGE_SIZE,
  RECIPE_LIST_SORT_FIELDS,
} from '../constants.js';
import { buildNotFoundError, normalizeSlug } from './utils.js';

const ALLOWED_SORT_FIELDS = new Set(RECIPE_LIST_SORT_FIELDS);

// Приводим число из query к безопасному положительному значению.
export function parsePositiveInteger(value, fallback, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseInt(String(value ?? ''), 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, max);
}

// Определяем направление сортировки.
export function normalizeSortOrder(value) {
  return String(value ?? '').trim().toLowerCase() === 'asc' ? 1 : -1;
}

// Собираем сортировку только из разрешенных полей.
export function buildSort(query) {
  const sortBy = ALLOWED_SORT_FIELDS.has(String(query.sortBy ?? '').trim())
    ? String(query.sortBy).trim()
    : 'createdAt';
  const sortOrder = normalizeSortOrder(query.sortOrder);

  return { [sortBy]: sortOrder };
}

// Превращаем query-параметры в Mongo-фильтр.
export async function buildRecipeListFilter(query) {
  const filter = {};
  const searchValue = typeof query.q === 'string' ? query.q.trim() : '';
  const tagValue = typeof query.tag === 'string' ? query.tag.trim() : '';
  const mealTypeValue = typeof query.mealType === 'string' ? query.mealType.trim() : '';
  const cuisineValue = typeof query.cuisine === 'string' ? query.cuisine.trim() : '';

  if (searchValue) {
    filter.$text = { $search: searchValue };
  }

  if (tagValue) {
    filter.tags = tagValue;
  }

  if (mealTypeValue) {
    const mealTypeSlug = normalizeSlug(mealTypeValue);
    const mealType = await MealType.findOne({ slug: mealTypeSlug, isActive: true }).select('_id');

    if (!mealType) {
      buildNotFoundError('Meal type not found.', 'MEAL_TYPE_NOT_FOUND');
    }

    filter.mealTypeIds = mealType._id;
  }

  if (cuisineValue) {
    const cuisineSlug = normalizeSlug(cuisineValue);
    const cuisine = await Cuisine.findOne({ slug: cuisineSlug, isActive: true }).select('_id');

    if (!cuisine) {
      buildNotFoundError('Cuisine not found.', 'CUISINE_NOT_FOUND');
    }

    filter.cuisineId = cuisine._id;
  }

  return filter;
}

export {
  RECIPE_LIST_DEFAULT_PAGE as DEFAULT_PAGE,
  RECIPE_LIST_DEFAULT_PAGE_SIZE as DEFAULT_PAGE_SIZE,
  RECIPE_LIST_MAX_PAGE_SIZE as MAX_PAGE_SIZE,
};
