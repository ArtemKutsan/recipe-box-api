import { Cuisine } from './model.js';

// DTO справочника отдаёт только данные, нужные фильтрам рецептов.
function toCuisineDto(cuisine) {
  return {
    id: cuisine._id.toString(),
    title: cuisine.title,
    slug: cuisine.slug,
    recipesCount: cuisine.recipesCount,
  };
}

export async function getCuisines() {
  // Показываем только активные кухни в ручном порядке.
  const cuisines = await Cuisine.find({ isActive: true }).sort({ order: 1, title: 1 });

  return {
    items: cuisines.map(toCuisineDto),
  };
}
