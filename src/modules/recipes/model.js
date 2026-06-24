import { model } from 'mongoose';
import { recipeSchema } from './schema.js';

// Модель рецепта будут использовать сервисы списка, деталей и создания рецептов.
export const Recipe = model('Recipe', recipeSchema);
