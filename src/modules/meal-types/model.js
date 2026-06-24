import { model } from 'mongoose';
import { mealTypeSchema } from './schema.js';

// Модель типа блюда нужна рецептам и API справочника mealTypes.
export const MealType = model('MealType', mealTypeSchema);
