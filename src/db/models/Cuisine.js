import { Schema, model } from 'mongoose';

// Схема кухни хранит справочник кухонь для фильтрации рецептов.
const cuisineSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // slug нужен для стабильных URL и фильтров, например cuisine=italian.
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

cuisineSchema.index({ isActive: 1, order: 1 });

// Модель кухни нужна рецептам и API справочника cuisines.
export const Cuisine = model('Cuisine', cuisineSchema);
