/**
 * Здесь меняется рецепт, но только если он принадлежит пользователю, который отправил запрос.
 * Файл обновляет только поля, которые действительно пришли с фронтенда через PATCH.
 * Если изменились типы питания или кухня, он также обновляет количество рецептов
 * в соответствующих справочниках.
 * Принимает: номер рецепта, только изменяемые поля и объект пользователя из cookie-сессии.
 * Возвращает: `{ recipe: {...} }` с обновлённым рецептом для фронтенда.
 * Пример: `updateRecipe('42', { title: 'New pasta' }, author)`.
 */
import mongoose from 'mongoose';
import { Recipe } from '#db/models/Recipe.js';
import { RECIPE_DIFFICULTIES, RECIPE_DIFFICULTY_ERROR, RECIPE_VISIBILITIES, RECIPE_VISIBILITY_ERROR } from '../constants.js';
import { MealType } from '#db/models/MealType.js';
import { Cuisine } from '#db/models/Cuisine.js';
import { buildNotFoundError, normalizeStringArray, parseRecipePublicId } from '../shared/utils.js';
import { resolveRecipeCuisine, resolveRecipeMealTypes } from '../shared/dictionaries.js';
import { toRecipeDetailResponse } from '../shared/response.js';
import { resolveRecipeThumbnail } from './media.js';
import { deleteMediaObject } from '../../uploads/service.js';

const ALLOWED_DIFFICULTIES = new Set(RECIPE_DIFFICULTIES);
const ALLOWED_VISIBILITIES = new Set(RECIPE_VISIBILITIES);

function getRecipeThumbnailKey(value, authorId) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  const thumbnailKey = String(value).trim();
  const authorFolder = `recipes/${authorId.toString()}/`;

  if (!thumbnailKey.startsWith(authorFolder)) {
    const error = new Error('thumbnailKey must belong to the current user.');
    error.status = 403;
    error.code = 'MEDIA_ACCESS_DENIED';
    throw error;
  }

  return thumbnailKey;
}

function toIdString(value) {
  return value?.toString();
}

// Находим связи, которые появились после обновления.
function getAddedIds(previousIds, nextIds) {
  const previous = new Set(previousIds.map(toIdString));

  return nextIds.filter((id) => !previous.has(toIdString(id)));
}

// Находим связи, которые были удалены после обновления.
function getRemovedIds(previousIds, nextIds) {
  const next = new Set(nextIds.map(toIdString));

  return previousIds.filter((id) => !next.has(toIdString(id)));
}

// Добавляем поле в объект обновления только если клиент реально его передал.
function setIfDefined(target, field, value) {
  if (value !== undefined) {
    target[field] = value;
  }
}

// Собираем Mongo `$set` только из полей, которые можно менять через PATCH.
function buildRecipeUpdate(payload, dictionaryData = {}, authorId) {
  const update = {};

  setIfDefined(update, 'title', payload.title?.trim());
  setIfDefined(
    update,
    'description',
    typeof payload.description === 'string' ? payload.description.trim() : payload.description,
  );
  setIfDefined(
    update,
    'authorNote',
    typeof payload.authorNote === 'string' ? payload.authorNote.trim() : payload.authorNote,
  );
  setIfDefined(update, 'mealTypeIds', dictionaryData.mealTypeIds);
  setIfDefined(update, 'cuisineId', dictionaryData.cuisine?._id);
  setIfDefined(update, 'tags', payload.tags === undefined ? undefined : normalizeStringArray(payload.tags));
  setIfDefined(
    update,
    'ingredients',
    payload.ingredients === undefined ? undefined : normalizeStringArray(payload.ingredients),
  );
  setIfDefined(
    update,
    'instructions',
    payload.instructions === undefined ? undefined : normalizeStringArray(payload.instructions),
  );
  setIfDefined(
    update,
    'prepTimeMinutes',
    payload.prepTimeMinutes === undefined ? undefined : Number(payload.prepTimeMinutes),
  );
  setIfDefined(
    update,
    'cookTimeMinutes',
    payload.cookTimeMinutes === undefined ? undefined : Number(payload.cookTimeMinutes),
  );
  setIfDefined(update, 'servings', payload.servings === undefined ? undefined : Number(payload.servings));
  setIfDefined(
    update,
    'caloriesPerServing',
    payload.caloriesPerServing === undefined ? undefined : Number(payload.caloriesPerServing),
  );

  if (payload.difficulty !== undefined) {
    const difficulty = String(payload.difficulty).trim().toLowerCase();

    if (!ALLOWED_DIFFICULTIES.has(difficulty)) {
      const error = new Error(RECIPE_DIFFICULTY_ERROR);
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = [RECIPE_DIFFICULTY_ERROR];
      throw error;
    }

    update.difficulty = difficulty;
  }

  setIfDefined(update, 'images', payload.images === undefined ? undefined : normalizeStringArray(payload.images));

  if (payload.visibility !== undefined) {
    const visibility = String(payload.visibility).trim().toLowerCase();

    if (!ALLOWED_VISIBILITIES.has(visibility)) {
      const error = new Error(RECIPE_VISIBILITY_ERROR);
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      error.details = [RECIPE_VISIBILITY_ERROR];
      throw error;
    }

    update.visibility = visibility;
  }

  if (payload.thumbnailUrl !== undefined) {
    update.thumbnailUrl =
      typeof payload.thumbnailUrl === 'string' && payload.thumbnailUrl.trim()
        ? payload.thumbnailUrl.trim()
        : null;
  }

  setIfDefined(update, 'thumbnailKey', getRecipeThumbnailKey(payload.thumbnailKey, authorId));

  return update;
}

// Обновляем только рецепт текущего пользователя и синхронизируем счетчики справочников.
export async function updateRecipe(recipeId, payload, author) {
  const publicId = parseRecipePublicId(recipeId);

  const recipe = await Recipe.findOne({ publicId, authorId: author._id });

  if (!recipe) {
    buildNotFoundError('Recipe not found.', 'RECIPE_NOT_FOUND');
  }

  const dictionaryData = {};

  if (payload.mealType !== undefined) {
    const { mealTypeIds } = await resolveRecipeMealTypes(payload.mealType);
    dictionaryData.mealTypeIds = mealTypeIds;
  }

  if (payload.cuisine !== undefined) {
    const cuisine = await resolveRecipeCuisine(payload.cuisine);
    dictionaryData.cuisine = cuisine;
  }

  const update = buildRecipeUpdate(payload, dictionaryData, author._id);
  const previousThumbnailKey = recipe.thumbnailKey;
  const previousMealTypeIds = recipe.mealTypeIds;
  const nextMealTypeIds = update.mealTypeIds ?? recipe.mealTypeIds;
  const addedMealTypeIds = getAddedIds(previousMealTypeIds, nextMealTypeIds);
  const removedMealTypeIds = getRemovedIds(previousMealTypeIds, nextMealTypeIds);
  const previousCuisineId = recipe.cuisineId;
  const nextCuisineId = update.cuisineId ?? recipe.cuisineId;
  const cuisineChanged = toIdString(previousCuisineId) !== toIdString(nextCuisineId);
  const session = await mongoose.startSession();

  try {
    // Рецепт и счетчики справочников меняются вместе, чтобы данные не расходились.
    await session.withTransaction(async () => {
      await Recipe.updateOne({ _id: recipe._id }, { $set: update }, { session });

      if (addedMealTypeIds.length > 0) {
        await MealType.updateMany(
          { _id: { $in: addedMealTypeIds } },
          { $inc: { recipesCount: 1 } },
          { session },
        );
      }

      if (removedMealTypeIds.length > 0) {
        await MealType.updateMany(
          { _id: { $in: removedMealTypeIds } },
          { $inc: { recipesCount: -1 } },
          { session },
        );
      }

      if (cuisineChanged && previousCuisineId) {
        await Cuisine.updateOne({ _id: previousCuisineId }, { $inc: { recipesCount: -1 } }, { session });
      }

      if (cuisineChanged && nextCuisineId) {
        await Cuisine.updateOne({ _id: nextCuisineId }, { $inc: { recipesCount: 1 } }, { session });
      }
    });
  } finally {
    await session.endSession();
  }

  const updatedRecipe = await Recipe.findById(recipe._id)
    .populate('authorId', 'publicId name avatarUrl avatarKey')
    .populate('mealTypeIds', 'title')
    .populate('cuisineId', 'title')
    .lean();

  if (previousThumbnailKey && previousThumbnailKey !== updatedRecipe.thumbnailKey) {
    await deleteMediaObject(previousThumbnailKey);
  }

  return {
    recipe: toRecipeDetailResponse(await resolveRecipeThumbnail(updatedRecipe)),
  };
}
