import { model } from 'mongoose';
import { favoriteSchema } from './schema.js';

// Явно фиксируем имя коллекции, чтобы оно не зависело от правил Mongoose.
export const Favorite = model('Favorite', favoriteSchema, 'favorites');
