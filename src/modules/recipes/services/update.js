import mongoose from 'mongoose';
import { Recipe } from '../model.js';
import { RECIPE_DIFFICULTIES, RECIPE_DIFFICULTY_ERROR } from '../constants.js';
import { MealType } from '#modules/meal-types/model.js';
import { Cuisine } from '#modules/cuisines/model.js';
import { buildNotFoundError, normalizeStringArray, parseRecipePublicId } from '../shared/utils.js';
import { resolveRecipeCuisine, resolveRecipeMealTypes } from '../shared/dictionaries.js';
import { toRecipeDetailResponse } from '../shared/response.js';

const ALLOWED_DIFFICULTIES = new Set(RECIPE_DIFFICULTIES);

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
function buildRecipeUpdate(payload, dictionaryData = {}) {
  const update = {};

  setIfDefined(update, 'title', payload.title?.trim());
  setIfDefined(
    update,
    'description',
    typeof payload.description === 'string' ? payload.description.trim() : payload.description,
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

  if (payload.thumbnailUrl !== undefined) {
    update.thumbnailUrl =
      typeof payload.thumbnailUrl === 'string' && payload.thumbnailUrl.trim()
        ? payload.thumbnailUrl.trim()
        : null;
  }

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

  const update = buildRecipeUpdate(payload, dictionaryData);
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
    .populate('authorId', 'publicId name')
    .populate('mealTypeIds', 'title')
    .populate('cuisineId', 'title')
    .lean();

  return {
    recipe: toRecipeDetailResponse(updatedRecipe),
  };
}
