import { MealType } from '#db/models/MealType.js';
import { toMealTypeResponse } from './response.js';

export async function getMealTypes() {
  // Показываем только активные типы блюда в ручном порядке.
  const mealTypes = await MealType.find({ isActive: true }).sort({ order: 1, title: 1 });

  return {
    items: mealTypes.map(toMealTypeResponse),
  };
}
