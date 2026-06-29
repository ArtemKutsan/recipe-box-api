import mongoose from 'mongoose';
import { Recipe } from '../model.js';
import { MealType } from '#modules/meal-types/model.js';
import { Cuisine } from '#modules/cuisines/model.js';
import { buildNotFoundError } from '../shared/utils.js';

// Удаляем только рецепт текущего пользователя и уменьшаем счетчики справочников.
export async function deleteRecipe(recipeId, author) {
  if (!mongoose.isValidObjectId(recipeId)) {
    buildNotFoundError('Recipe not found.', 'RECIPE_NOT_FOUND');
  }

  const recipe = await Recipe.findOne({ _id: recipeId, authorId: author._id });

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
