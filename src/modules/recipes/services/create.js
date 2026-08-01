/**
 * Здесь создаётся новый рецепт от имени пользователя, который отправил запрос.
 * Файл приводит данные формы к нужному виду, находит выбранные типы питания и кухню,
 * выдаёт рецепту короткий публичный id и сохраняет всё в базе данных.
 * Одновременно обновляется количество рецептов у выбранных типов питания и кухни.
 * Принимает: данные нового рецепта и объект автора из JWT.
 * Возвращает: `{ recipe: {...} }` с созданным рецептом для фронтенда.
 * Пример: `createRecipe({ title: 'Pasta', mealType: ['dinner'], cuisine: 'italian' }, author)`.
 */
import mongoose from 'mongoose';
import { Recipe } from '../model.js';
import { RECIPE_DIFFICULTIES, RECIPE_DIFFICULTY_ERROR, RECIPE_VISIBILITIES, RECIPE_VISIBILITY_ERROR } from '../constants.js';
import { MealType } from '#db/models/MealType.js';
import { Cuisine } from '#db/models/Cuisine.js';
import { getNextSequence } from '#shared/counters/service.js';
import { normalizeStringArray } from '../shared/utils.js';
import { resolveRecipeDictionaries } from '../shared/dictionaries.js';
import { toRecipeDetailResponseFromCreate } from '../shared/response.js';

const ALLOWED_DIFFICULTIES = new Set(RECIPE_DIFFICULTIES);
const ALLOWED_VISIBILITIES = new Set(RECIPE_VISIBILITIES);

// Создаем рецепт и обновляем связанные справочники в одной транзакции.
export async function createRecipe(payload, author) {
  const tags = normalizeStringArray(payload.tags);
  const ingredients = normalizeStringArray(payload.ingredients);
  const instructions = normalizeStringArray(payload.instructions);
  const images = normalizeStringArray(payload.images);
  const difficulty = payload.difficulty ? String(payload.difficulty).trim().toLowerCase() : 'medium';
  const visibility = payload.visibility ? String(payload.visibility).trim().toLowerCase() : 'public';

  if (!ALLOWED_DIFFICULTIES.has(difficulty)) {
    const error = new Error(RECIPE_DIFFICULTY_ERROR);
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = [RECIPE_DIFFICULTY_ERROR];
    throw error;
  }

  if (!ALLOWED_VISIBILITIES.has(visibility)) {
    const error = new Error(RECIPE_VISIBILITY_ERROR);
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = [RECIPE_VISIBILITY_ERROR];
    throw error;
  }

  const { mealTypeIds, mealTypeTitles, cuisine } = await resolveRecipeDictionaries(payload);

  const session = await mongoose.startSession();

  try {
    let createdRecipe = null;

    // Все операции ниже должны пройти вместе, иначе Mongo откатит их.
    await session.withTransaction(async () => {
      // Выдаём короткий публичный номер рецепта в той же транзакции.
      const publicId = await getNextSequence('recipes', { session });

      // Создаем сам рецепт в рамках текущей транзакции.
      const [recipe] = await Recipe.create(
        [
          {
            publicId,
            authorId: author._id,
            title: payload.title.trim(),
            description: typeof payload.description === 'string' ? payload.description.trim() : '',
            authorNote: typeof payload.authorNote === 'string' ? payload.authorNote.trim() : '',
            mealTypeIds,
            cuisineId: cuisine._id,
            tags,
            ingredients,
            instructions,
            prepTimeMinutes: Number(payload.prepTimeMinutes),
            cookTimeMinutes: Number(payload.cookTimeMinutes),
            servings: Number(payload.servings),
            difficulty,
            visibility,
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
