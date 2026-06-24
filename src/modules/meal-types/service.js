import { MealType } from './model.js';

// DTO справочника отдаёт только данные, нужные фильтрам рецептов.
function toMealTypeDto(mealType) {
  return {
    id: mealType._id.toString(),
    title: mealType.title,
    slug: mealType.slug,
    recipesCount: mealType.recipesCount,
  };
}

export async function getMealTypes() {
  // Показываем только активные типы блюда в ручном порядке.
  const mealTypes = await MealType.find({ isActive: true }).sort({ order: 1, title: 1 });

  return {
    items: mealTypes.map(toMealTypeDto),
  };
}
