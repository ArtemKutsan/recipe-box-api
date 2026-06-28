import { toRecipeAuthorResponse } from './utils.js';

// Собираем короткий ответ для списка рецептов.
export function toRecipeListResponse(recipe) {
  return {
    id: recipe._id.toString(),
    title: recipe.title,
    mealType: Array.isArray(recipe.mealTypeIds)
      ? recipe.mealTypeIds.map((item) => item.title).filter(Boolean)
      : [],
    tags: recipe.tags ?? [],
    cuisine: recipe.cuisineId?.title ?? null,
    rating: recipe.rating ?? null,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    thumbnailUrl: recipe.thumbnailUrl,
    author: toRecipeAuthorResponse(recipe.authorId),
  };
}

// Собираем детальный ответ для рецепта.
function buildRecipeDetailResponse(recipe, mealTypeTitles, cuisine, author) {
  return {
    id: recipe._id.toString(),
    title: recipe.title,
    description: recipe.description,
    mealType: mealTypeTitles,
    tags: recipe.tags,
    cuisine: cuisine.title,
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
