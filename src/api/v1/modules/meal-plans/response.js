import { createEmptyMealPlanSlots } from '#shared/meal-plans/constants.js';

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

// Собираем ответ для current meal plan в одном месте.
export function toMealPlanResponse(mealPlan) {
  return {
    mealPlan: {
      slots: mergeMealPlanSlots(mealPlan?.slots),
      updatedAt: mealPlan?.updatedAt ?? null,
    },
  };
}
