import { Cuisine } from './model.js';
import { toCuisineResponse } from './shared/response.js';

export async function getCuisines() {
  // Показываем только активные кухни в ручном порядке.
  const cuisines = await Cuisine.find({ isActive: true }).sort({ order: 1, title: 1 });

  return {
    items: cuisines.map(toCuisineResponse),
  };
}
