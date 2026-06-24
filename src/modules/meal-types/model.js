import { model } from 'mongoose';
import { mealTypeSchema } from './schema.js';

// Третий аргумент фиксирует имя коллекции, чтобы Mongoose не создал mealtypes.
export const MealType = model('MealType', mealTypeSchema, 'mealTypes');
