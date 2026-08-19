/**
 * Здесь удаляется рецепт, но только если он принадлежит пользователю, который отправил запрос.
 * Вместе с рецептом уменьшается количество рецептов у его типов питания и кухни.
 * Все изменения сохраняются одной операцией: если что-то не получилось, база не останется
 * в состоянии, где рецепт уже удалён, а счётчики ещё не обновились.
 * Принимает: номер рецепта из URL и объект пользователя из cookie-сессии.
 * Возвращает: `{ message: 'Recipe deleted.' }`.
 * Пример: `deleteRecipe('42', author)`.
 */
import mongoose from 'mongoose';
import { Recipe } from '#db/models/Recipe.js';
import { MealType } from '#db/models/MealType.js';
import { Cuisine } from '#db/models/Cuisine.js';
import { buildNotFoundError, parseRecipePublicId } from '../shared/utils.js';

// Удаляем только рецепт текущего пользователя и уменьшаем счетчики справочников.
export async function deleteRecipe(recipeId, author) {
  const publicId = parseRecipePublicId(recipeId);

  const recipe = await Recipe.findOne({ publicId, authorId: author._id });

  if (!recipe) {
    buildNotFoundError('Recipe not found.', 'RECIPE_NOT_FOUND');
  }

  const session = await mongoose.startSession();

  try {
    // Удаление рецепта и пересчет справочников должны пройти одной транзакцией.
    await session.withTransaction(async () => {
      await Recipe.deleteOne({ _id: recipe._id }, { session });

      if (recipe.mealTypeIds.length > 0) {
        await MealType.updateMany(
          { _id: { $in: recipe.mealTypeIds } },
          { $inc: { recipesCount: -1 } },
          { session },
        );
      }

      if (recipe.cuisineId) {
        await Cuisine.updateOne({ _id: recipe.cuisineId }, { $inc: { recipesCount: -1 } }, { session });
      }
    });
  } finally {
    await session.endSession();
  }

  return {
    message: 'Recipe deleted.',
  };
}
