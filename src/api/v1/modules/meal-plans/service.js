import { MealPlan } from '#db/models/MealPlan.js';
import { Recipe } from '#db/models/Recipe.js';
import { buildNotFoundError } from '../recipes/shared/utils.js';
import { createEmptyMealPlanSlots } from '#domain/meal-plans/constants.js';
import { toMealPlanResponse } from './response.js';

async function ensureRecipeExists(recipeId) {
  if (recipeId === null) {
    return null;
  }

  const recipe = await Recipe.findOne({ publicId: recipeId }).select('_id').lean();

  if (!recipe) {
    buildNotFoundError('Recipe not found.', 'RECIPE_NOT_FOUND');
  }

  return recipeId;
}

// Возвращаем текущий weekly meal plan пользователя или пустой шаблон.
export async function getCurrentMealPlan(user) {
  const mealPlan = await MealPlan.findOne({ userId: user._id }).lean();

  return toMealPlanResponse(mealPlan);
}

// Меняем один слот и создаём meal plan при первом изменении.
export async function updateCurrentMealPlanSlot(payload, user) {
  const recipeId = payload.recipeId === null ? null : Number(payload.recipeId);

  await ensureRecipeExists(recipeId);

  const mealPlan = (await MealPlan.findOne({ userId: user._id })) ??
    new MealPlan({
      userId: user._id,
      slots: createEmptyMealPlanSlots(),
    });

  mealPlan.slots[payload.day][payload.mealPeriod] = recipeId;
  await mealPlan.save();

  return toMealPlanResponse(mealPlan.toObject());
}
