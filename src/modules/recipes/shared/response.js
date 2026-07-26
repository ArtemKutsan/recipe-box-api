/**
 * Здесь из данных рецепта из базы собираются объекты, которые сервер отдаёт фронтенду.
 * Файл решает, какие поля попадут в список рецептов, на страницу одного рецепта
 * и в список кухонь. Он ничего не ищет в базе и ничего в ней не меняет.
 * Принимает: рецепт или кухню из MongoDB, при необходимости уже с подгруженными связями.
 * Возвращает: простой объект, который можно сразу отдать фронтенду в JSON.
 * Пример: `toRecipeListResponse(recipe)` возвращает карточку рецепта для списка.
 */
import { toRecipeAuthorResponse } from './utils.js';

// Собираем короткий ответ для списка рецептов.
export function toRecipeListResponse(recipe) {
  return {
    id: recipe.publicId,
    title: recipe.title,
    description: recipe.description ?? '',
    mealType: Array.isArray(recipe.mealTypeIds)
      ? recipe.mealTypeIds.map((item) => item.title).filter(Boolean)
      : [],
    tags: recipe.tags ?? [],
    cuisine: recipe.cuisineId?.title ?? null,
    visibility: recipe.visibility ?? 'public',
    rating: recipe.rating ?? null,
    caloriesPerServing: recipe.caloriesPerServing ?? null,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    servings: recipe.servings,
    difficulty: recipe.difficulty ?? null,
    thumbnailUrl: recipe.thumbnailUrl,
    author: toRecipeAuthorResponse(recipe.authorId),
  };
}

// Собираем короткий ответ для кухни в списке рецептов.
export function toCuisineResponse(cuisine) {
  return {
    title: cuisine.title,
    slug: cuisine.slug,
    recipesCount: cuisine.recipesCount,
  };
}

// Собираем детальный ответ для рецепта.
function buildRecipeDetailResponse(recipe, mealTypeTitles, cuisine, author) {
  return {
    id: recipe.publicId,
    title: recipe.title,
    description: recipe.description,
    authorNote: recipe.authorNote ?? '',
    mealType: mealTypeTitles,
    tags: recipe.tags,
    cuisine: cuisine.title,
    visibility: recipe.visibility ?? 'public',
    rating: recipe.rating ?? null,
    caloriesPerServing: recipe.caloriesPerServing ?? null,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    thumbnailUrl: recipe.thumbnailUrl,
    images: recipe.images,
    author: toRecipeAuthorResponse(author),
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
  };
}

// Делаем detail ответ из рецепта, где связи уже подгружены populate-ом.
export function toRecipeDetailResponse(recipe) {
  const mealTypeTitles = Array.isArray(recipe.mealTypeIds)
    ? recipe.mealTypeIds.map((item) => item.title).filter(Boolean)
    : [];

  return buildRecipeDetailResponse(
    recipe,
    mealTypeTitles,
    recipe.cuisineId ?? { title: null },
    recipe.authorId,
  );
}

// Делаем detail ответ из данных create-сценария.
export function toRecipeDetailResponseFromCreate(recipe, mealTypeTitles, cuisine, author) {
  return buildRecipeDetailResponse(recipe, mealTypeTitles, cuisine, author);
}
