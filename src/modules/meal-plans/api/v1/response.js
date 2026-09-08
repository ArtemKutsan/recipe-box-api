import { createEmptyMealPlanSlots } from '#modules/meal-plans/constants.js';

// Подставляем пустые null-слоты, если план еще не создан или документ неполный.
function mergeMealPlanSlots(slots = {}) {
  const emptySlots = createEmptyMealPlanSlots();

  return Object.fromEntries(
    Object.entries(emptySlots).map(([day, mealPeriods]) => [
      day,
      Object.fromEntries(
        Object.keys(mealPeriods).map((mealPeriod) => [
          mealPeriod,
          slots?.[day]?.[mealPeriod] ?? null,
        ]),
      ),
    ]),
  );
}

function toMealPlanRecipeResponse(recipe) {
  return {
    id: recipe.publicId,
    title: recipe.title,
    caloriesPerServing: recipe.caloriesPerServing ?? null,
    thumbnailUrl: recipe.thumbnailUrl ?? null,
  };
}

function enrichMealPlanSlots(slots, recipes) {
  const recipesByPublicId = new Map(
    recipes.map((recipe) => [String(recipe.publicId), toMealPlanRecipeResponse(recipe)]),
  );

  return Object.fromEntries(
    Object.entries(mergeMealPlanSlots(slots)).map(([day, mealPeriods]) => [
      day,
      Object.fromEntries(
        Object.entries(mealPeriods).map(([mealPeriod, recipeId]) => [
          mealPeriod,
          recipeId === null ? null : recipesByPublicId.get(String(recipeId)) ?? null,
        ]),
      ),
    ]),
  );
}

// Собираем ответ для current meal plan в одном месте.
export function toMealPlanResponse(mealPlan, recipes = []) {
  return {
    mealPlan: {
      slots: enrichMealPlanSlots(mealPlan?.slots, recipes),
      updatedAt: mealPlan?.updatedAt ?? null,
    },
  };
}
