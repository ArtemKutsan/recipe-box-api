import { model } from 'mongoose';
import { mealPlanSchema } from './schema.js';

// Явно задаем имя коллекции, чтобы Mongoose не создал mealplans.
export const MealPlan = model('MealPlan', mealPlanSchema, 'mealPlans');
