import { Recipe } from '../model.js';
import { toRecipeListResponse } from '../shared/response.js';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  buildRecipeListFilter,
  buildSort,
  parsePositiveInteger,
} from '../shared/query.js';

// Возвращаем список рецептов с пагинацией и фильтрами.
export async function getRecipes(query = {}) {
  const filter = await buildRecipeListFilter(query);

  return getRecipesByFilter(filter, query);
}

// Возвращаем список рецептов конкретного автора.
export async function getRecipesByAuthor(authorId, query = {}) {
  return getRecipesByFilter({ authorId }, query);
}

async function getRecipesByFilter(filter, query = {}) {
  const page = parsePositiveInteger(query.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const sort = buildSort(query);
  const skip = (page - 1) * pageSize;

  const [total, recipes] = await Promise.all([
    Recipe.countDocuments(filter),
    Recipe.find(filter)
      .populate('authorId', 'publicId name')
      .populate('mealTypeIds', 'title')
      .populate('cuisineId', 'title')
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .lean(),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  return {
    items: recipes.map(toRecipeListResponse),
    page,
    pageSize,
    total,
    totalPages,
  };
}
