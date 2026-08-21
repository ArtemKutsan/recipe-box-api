import { MEAL_PLAN_DAYS, MEAL_PLAN_PERIODS } from '#domain/meal-plans/constants.js';

const MEAL_PLAN_DAY_SET = new Set(MEAL_PLAN_DAYS);
const MEAL_PLAN_PERIOD_SET = new Set(MEAL_PLAN_PERIODS);

// Общий helper для ошибок валидации meal plan.
function throwValidationError(errors) {
  const error = new Error('Validation failed');
  error.status = 400;
  error.code = 'VALIDATION_ERROR';
  error.details = errors;
  throw error;
}

function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

// Проверяем body для изменения одного слота meal plan.
export function validateUpdateMealPlanSlot(payload) {
  const body = payload || {};
  const errors = [];

  if (typeof body.day !== 'string' || !MEAL_PLAN_DAY_SET.has(body.day)) {
    errors.push(`day must be one of: ${MEAL_PLAN_DAYS.join(', ')}`);
  }

  if (typeof body.mealPeriod !== 'string' || !MEAL_PLAN_PERIOD_SET.has(body.mealPeriod)) {
    errors.push(`mealPeriod must be one of: ${MEAL_PLAN_PERIODS.join(', ')}`);
  }

  if (!Object.prototype.hasOwnProperty.call(body, 'recipeId')) {
    errors.push('recipeId is required');
  } else if (body.recipeId !== null && !isPositiveInteger(body.recipeId)) {
    errors.push('recipeId must be a positive integer or null');
  }

  if (errors.length > 0) {
    throwValidationError(errors);
  }

  return [];
}
