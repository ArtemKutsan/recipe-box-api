export const MEAL_PLAN_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const MEAL_PLAN_PERIODS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export function createEmptyMealPlanSlots() {
  return Object.fromEntries(
    MEAL_PLAN_DAYS.map((day) => [
      day,
      Object.fromEntries(MEAL_PLAN_PERIODS.map((mealPeriod) => [mealPeriod, null])),
    ]),
  );
}
