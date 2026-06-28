import { MealType } from './model.js';
import { toMealTypeResponse } from './shared/response.js';

export async function getMealTypes() {
  // Показываем только активные типы блюда в ручном порядке.
  const mealTypes = await MealType.find({ isActive: true }).sort({ order: 1, title: 1 });

  return {
    items: mealTypes.map(toMealTypeResponse),
  };
}
