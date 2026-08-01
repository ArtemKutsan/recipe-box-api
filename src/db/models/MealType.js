import { Schema, model } from 'mongoose';

// Схема типа блюда хранит справочник категорий рецептов.
const mealTypeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // slug нужен для стабильных URL и фильтров, например mealType=dinner.
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // order задаёт ручной порядок вывода в интерфейсе.
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Счётчик обновляется при изменении рецептов и ускоряет вывод фильтров.
    recipesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

mealTypeSchema.index({ isActive: 1, order: 1 });

// Третий аргумент фиксирует имя коллекции, чтобы Mongoose не создал mealtypes.
export const MealType = model('MealType', mealTypeSchema, 'mealTypes');
