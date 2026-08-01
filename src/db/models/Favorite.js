import { Schema, model } from 'mongoose';

const { ObjectId } = Schema.Types;

// Favorite хранит только связь пользователя с сохраненным рецептом.
const favoriteSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    recipeId: {
      type: ObjectId,
      ref: 'Recipe',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Один пользователь не может сохранить один рецепт несколько раз.
favoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });
// Этот индекс обслуживает постраничный список от недавно сохраненных рецептов.
favoriteSchema.index({ userId: 1, createdAt: -1 });

// Явно фиксируем имя коллекции, чтобы оно не зависело от правил Mongoose.
export const Favorite = model('Favorite', favoriteSchema, 'favorites');
