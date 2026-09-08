import { MealPlan } from '#db/models/MealPlan.js';
import { Recipe } from '#db/models/Recipe.js';
import { buildNotFoundError } from '#modules/recipes/api/v1/shared/utils.js';
import { resolveRecipeThumbnail } from '#modules/recipes/api/v1/services/media.js';
import { createEmptyMealPlanSlots } from '#modules/meal-plans/constants.js';
import { toMealPlanResponse } from './response.js';

async function ensureRecipeExists(recipeId) {
  if (recipeId === null) {
    return null;
  }

  const recipe = await Recipe.findOne({ publicId: recipeId }).select('_id').lean();

  if (!recipe) {
    throw buildNotFoundError('Recipe not found.', 'RECIPE_NOT_FOUND');
  }

  return recipeId;
}

function collectRecipePublicIds(slots = {}) {
  return Object.values(slots).flatMap((mealPeriods) => Object.values(mealPeriods ?? {}))
    .filter(Boolean)
    .map(Number);
}

async function getMealPlanRecipes(mealPlan) {
  const recipePublicIds = [...new Set(collectRecipePublicIds(mealPlan?.slots))];

  if (recipePublicIds.length === 0) {
    return [];
  }

  const recipes = await Recipe.find({
    publicId: { $in: recipePublicIds },
  })
    .select('publicId title thumbnailUrl thumbnailKey caloriesPerServing')
    .lean();

  return Promise.all(recipes.map(resolveRecipeThumbnail));
}

// Возвращаем текущий weekly meal plan пользователя или пустой шаблон.
export async function getCurrentMealPlan(user) {
  const mealPlan = await MealPlan.findOne({ userId: user._id }).lean();
  const recipes = await getMealPlanRecipes(mealPlan);

  return toMealPlanResponse(mealPlan, recipes);
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

  const recipes = await getMealPlanRecipes(mealPlan.toObject());

  return toMealPlanResponse(mealPlan.toObject(), recipes);
}
