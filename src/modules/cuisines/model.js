import { model } from 'mongoose';
import { cuisineSchema } from './schema.js';

// Модель кухни нужна рецептам и API справочника cuisines.
export const Cuisine = model('Cuisine', cuisineSchema);
