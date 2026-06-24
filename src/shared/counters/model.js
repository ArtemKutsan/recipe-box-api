import { model } from 'mongoose';
import { counterSchema } from './schema.js';

// Модель нужна для атомарной выдачи publicId.
export const Counter = model('Counter', counterSchema);
