import mongoose from 'mongoose';
import { Recipe } from '../model.js';
import { RECIPE_DIFFICULTIES, RECIPE_DIFFICULTY_ERROR } from '../constants.js';
import { MealType } from '#modules/meal-types/model.js';
import { Cuisine } from '#modules/cuisines/model.js';
import { normalizeStringArray } from '../shared/utils.js';
import { resolveRecipeDictionaries } from '../shared/dictionaries.js';
import { toRecipeDetailResponseFromCreate } from '../shared/response.js';

const ALLOWED_DIFFICULTIES = new Set(RECIPE_DIFFICULTIES);

// Создаем рецепт и обновляем связанные справочники в одной транзакции.
export async function createRecipe(payload, author) {
  const tags = normalizeStringArray(payload.tags);
  const ingredients = normalizeStringArray(payload.ingredients);
  const instructions = normalizeStringArray(payload.instructions);
  const images = normalizeStringArray(payload.images);
  const difficulty = payload.difficulty ? String(payload.difficulty).trim().toLowerCase() : 'medium';

  if (!ALLOWED_DIFFICULTIES.has(difficulty)) {
    const error = new Error(RECIPE_DIFFICULTY_ERROR);
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = [RECIPE_DIFFICULTY_ERROR];
    throw error;
  }

  const { mealTypeIds, mealTypeTitles, cuisine } = await resolveRecipeDictionaries(payload);

  const session = await mongoose.startSession();

  try {
    let createdRecipe = null;

    // Все операции ниже должны пройти вместе, иначе Mongo откатит их.
    await session.withTransaction(async () => {
      // Создаем сам рецепт в рамках текущей транзакции.
      const [recipe] = await Recipe.create(
        [
          {
            authorId: author._id,
            title: payload.title.trim(),
            description: typeof payload.description === 'string' ? payload.description.trim() : '',
            mealTypeIds,
            cuisineId: cuisine._id,
            tags,
            ingredients,
            instructions,
            prepTimeMinutes: Number(payload.prepTimeMinutes),
            cookTimeMinutes: Number(payload.cookTimeMinutes),
            servings: Number(payload.servings),
            difficulty,
            images,
            thumbnailUrl:
              typeof payload.thumbnailUrl === 'string' && payload.thumbnailUrl.trim()
                ? payload.thumbnailUrl.trim()
                : null,
          },
        ],
        { session },
      );

      createdRecipe = recipe;

      // Обновляем счетчики справочников в том же транзакционном блоке.
      await MealType.updateMany(
        { _id: { $in: mealTypeIds } },
        { $inc: { recipesCount: 1 } },
        { session },
      );

      // То же самое делаем для кухни.
      await Cuisine.updateOne({ _id: cuisine._id }, { $inc: { recipesCount: 1 } }, { session });
    });

    return {
      recipe: toRecipeDetailResponseFromCreate(createdRecipe, mealTypeTitles, cuisine, author),
    };
  } finally {
    await session.endSession();
  }
}
