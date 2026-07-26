import { Schema } from 'mongoose';

const { ObjectId } = Schema.Types;

// Favorite хранит только связь пользователя с сохраненным рецептом.
export const favoriteSchema = new Schema(
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
