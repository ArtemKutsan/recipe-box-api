import { Schema } from 'mongoose';

const { ObjectId } = Schema.Types;

const RECIPE_DIFFICULTIES = ['easy', 'medium', 'hard'];

// Схема рецепта хранит основной контент и связи со справочниками.
export const recipeSchema = new Schema(
  {
    // Короткий публичный номер рецепта для API и URL.
    publicId: {
      type: Number,
      required: true,
      unique: true,
      sparse: true,
      index: true,
    },
    // Автор хранится как внутренняя Mongo-связь с пользователем.
    authorId: {
      type: ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    // Один рецепт может относиться к нескольким типам блюда.
    mealTypeIds: [
      {
        type: ObjectId,
        ref: 'MealType',
      },
    ],
    // Кухня пока необязательна, чтобы можно было сохранить простой рецепт.
    cuisineId: {
      type: ObjectId,
      ref: 'Cuisine',
      default: null,
      index: true,
    },
    caloriesPerServing: {
      type: Number,
      default: null,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    ingredients: {
      type: [String],
      default: [],
    },
    instructions: {
      type: [String],
      default: [],
    },
    prepTimeMinutes: {
      type: Number,
      default: null,
      min: 0,
    },
    cookTimeMinutes: {
      type: Number,
      default: null,
      min: 0,
    },
    servings: {
      type: Number,
      default: null,
      min: 1,
    },
    difficulty: {
      type: String,
      // enum ограничивает поле только значениями из списка сложностей.
      enum: RECIPE_DIFFICULTIES,
      default: 'medium',
    },
    rating: {
      type: Number,
      default: null,
      min: 0,
      max: 5,
    },
    images: {
      type: [String],
      default: [],
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });
recipeSchema.index({ mealTypeIds: 1 });
