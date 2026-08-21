import { Favorite } from '#db/models/Favorite.js';
import { Recipe } from '#db/models/Recipe.js';
import { buildNotFoundError, parseRecipePublicId } from '../recipes/shared/utils.js';
import {
  DEFAULT_FAVORITES_PAGE,
  DEFAULT_FAVORITES_PAGE_SIZE,
  MAX_FAVORITES_PAGE_SIZE,
} from './constants.js';
import { toFavoriteRecipeResponse, toFavoriteStateResponse } from './response.js';
import { resolveRecipeThumbnail } from '../recipes/services/media.js';

function parsePositiveInteger(value, fallback, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseInt(String(value ?? ''), 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, max);
}

async function findRecipeByPublicId(recipeId, { publicOnly = false } = {}) {
  const publicId = parseRecipePublicId(recipeId);
  const filter = { publicId };

  if (publicOnly) {
    // Старые рецепты без visibility продолжаем считать публичными.
    filter.$or = [{ visibility: 'public' }, { visibility: { $exists: false } }];
  }

  const recipe = await Recipe.findOne(filter).select('_id publicId').lean();

  if (!recipe) {
    buildNotFoundError('Recipe not found.', 'RECIPE_NOT_FOUND');
  }

  return recipe;
}

// Сохраняем публичный рецепт один раз независимо от повторных запросов.
export async function addFavorite(recipeId, user) {
  const recipe = await findRecipeByPublicId(recipeId, { publicOnly: true });

  const favorite = await Favorite.findOneAndUpdate(
    { userId: user._id, recipeId: recipe._id },
    { $setOnInsert: { userId: user._id, recipeId: recipe._id } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  return {
    favorite: toFavoriteStateResponse(recipe.publicId, true, favorite.createdAt),
  };
}

// Удаляем только связь текущего пользователя, не меняя User или Recipe.
export async function removeFavorite(recipeId, user) {
  const recipe = await findRecipeByPublicId(recipeId);

  await Favorite.deleteOne({ userId: user._id, recipeId: recipe._id });

  return {
    favorite: toFavoriteStateResponse(recipe.publicId, false),
  };
}

// Возвращаем все легкие Favorite-связи для глобального frontend state.
export async function getCurrentUserFavorites(user) {
  const favorites = await Favorite.aggregate([
    { $match: { userId: user._id } },
    {
      $lookup: {
        from: Recipe.collection.name,
        localField: 'recipeId',
        foreignField: '_id',
        as: 'recipe',
      },
    },
    { $unwind: '$recipe' },
    {
      $match: {
        $or: [
          { 'recipe.visibility': 'public' },
          { 'recipe.visibility': { $exists: false } },
        ],
      },
    },
    { $sort: { createdAt: -1, _id: -1 } },
    {
      $project: {
        _id: 0,
        recipeId: '$recipe.publicId',
        savedAt: '$createdAt',
      },
    },
  ]);

  return {
    items: favorites.map(({ recipeId, savedAt }) =>
      toFavoriteStateResponse(recipeId, true, savedAt),
    ),
  };
}

// Возвращаем сохраненные публичные рецепты для страницы профиля постранично.
export async function getCurrentUserFavoriteRecipes(query = {}, user) {
  const page = parsePositiveInteger(query.page, DEFAULT_FAVORITES_PAGE);
  const pageSize = parsePositiveInteger(
    query.pageSize,
    DEFAULT_FAVORITES_PAGE_SIZE,
    MAX_FAVORITES_PAGE_SIZE,
  );
  const skip = (page - 1) * pageSize;
  const [result] = await Favorite.aggregate([
    { $match: { userId: user._id } },
    {
      $lookup: {
        from: Recipe.collection.name,
        localField: 'recipeId',
        foreignField: '_id',
        as: 'recipe',
      },
    },
    { $unwind: '$recipe' },
    {
      $match: {
        $or: [
          { 'recipe.visibility': 'public' },
          { 'recipe.visibility': { $exists: false } },
        ],
      },
    },
    { $sort: { createdAt: -1, _id: -1 } },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        favorites: [
          { $skip: skip },
          { $limit: pageSize },
          { $project: { _id: 0, recipeId: 1, savedAt: '$createdAt' } },
        ],
      },
    },
  ]);
  const favoriteRows = result?.favorites ?? [];
  const recipeIds = favoriteRows.map(({ recipeId }) => recipeId);
  const recipes = await Recipe.find({ _id: { $in: recipeIds } })
    .populate('authorId', 'publicId name avatarUrl')
    .populate('mealTypeIds', 'title')
    .populate('cuisineId', 'title')
    .lean();
  const recipesById = new Map(recipes.map((recipe) => [recipe._id.toString(), recipe]));
  const items = (await Promise.all(
    favoriteRows.map(async ({ recipeId, savedAt }) => {
      const recipe = recipesById.get(recipeId.toString());

      return recipe
        ? toFavoriteRecipeResponse(await resolveRecipeThumbnail(recipe), savedAt)
        : null;
    }),
  ))
    .filter(Boolean);
  const total = result?.metadata?.[0]?.total ?? 0;

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
