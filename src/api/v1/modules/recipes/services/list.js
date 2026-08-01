/**
 * Здесь загружаются списки рецептов: общий каталог или рецепты одного пользователя.
 * Файл учитывает поиск, фильтры, сортировку и номер страницы.
 * Он не показывает приватные рецепты всем подряд, а вместе со списком возвращает кухни,
 * которые подходят к текущим выбранным фильтрам.
 * Принимает: query-параметры, например `{ page: '2', mealType: 'dinner' }`.
 * Возвращает: `{ items, page, pageSize, total, totalPages, cuisines }`.
 * Пример: `getRecipes({ q: 'pasta', page: '1' })`.
 */
import { Cuisine } from '#db/models/Cuisine.js';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../constants.js';
import { Recipe } from '#db/models/Recipe.js';
import { toRecipeListResponse } from '../shared/response.js';
import {
  buildRecipeListFilter,
  buildSort,
  parsePositiveInteger,
} from '../shared/query.js';

// Старые рецепты без `visibility` пока считаем публичными.
function buildPublicVisibilityFilter() {
  return {
    $or: [{ visibility: 'public' }, { visibility: { $exists: false } }],
  };
}

// Возвращаем список рецептов с пагинацией и фильтрами.
export async function getRecipes(query = {}) {
  const filter = await buildRecipeListFilter(query);

  return getRecipesByFilter({ $and: [filter, buildPublicVisibilityFilter()] }, query);
}

// Возвращаем список рецептов конкретного автора.
export async function getRecipesByAuthor(authorId, query = {}, { includePrivate = false } = {}) {
  const filter = await buildRecipeListFilter(query);

  return getRecipesByFilter(
    {
      $and: [
        { authorId },
        filter,
        ...(includePrivate ? [] : [buildPublicVisibilityFilter()]),
      ],
    },
    query,
  );
}

async function getCuisineList(filter) {
  const cuisineFilter = { ...filter };
  delete cuisineFilter.cuisineId;

  const cuisines = await Recipe.aggregate([
    { $match: { ...cuisineFilter, cuisineId: { $ne: null } } },
    {
      $group: {
        _id: '$cuisineId',
        recipesCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: Cuisine.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'cuisine',
      },
    },
    { $unwind: '$cuisine' },
    { $match: { 'cuisine.isActive': true } },
    {
      $project: {
        _id: 0,
        title: '$cuisine.title',
        slug: '$cuisine.slug',
        order: '$cuisine.order',
        recipesCount: 1,
      },
    },
    { $sort: { order: 1, title: 1 } },
  ]);

  return cuisines;
}

async function getRecipesByFilter(filter, query = {}) {
  const page = parsePositiveInteger(query.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const sort = buildSort(query);
  const skip = (page - 1) * pageSize;

  const [total, recipes, cuisines] = await Promise.all([
    Recipe.countDocuments(filter),
    Recipe.find(filter)
      .populate('authorId', 'publicId name')
      .populate('mealTypeIds', 'title')
      .populate('cuisineId', 'title')
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .lean(),
    getCuisineList(filter),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  return {
    items: recipes.map(toRecipeListResponse),
    page,
    pageSize,
    total,
    totalPages,
    cuisines,
  };
}
