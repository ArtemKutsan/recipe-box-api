import { model, Schema } from 'mongoose';

const { ObjectId } = Schema.Types;

// Пост хранит отдельную публикацию пользователя, а не копию рецепта.
const postSchema = new Schema(
  {
    // Короткий номер поста для API и URL.
    publicId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    // Автор берётся из текущей серверной сессии.
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
      maxlength: 160,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    // Пост может быть самостоятельным или ссылаться на публичный рецепт.
    recipeId: {
      type: ObjectId,
      ref: 'Recipe',
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

postSchema.index({ createdAt: -1, _id: -1 });

export const Post = model('Post', postSchema);
