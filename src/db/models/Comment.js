import { model, Schema } from 'mongoose';

const { ObjectId } = Schema.Types;

// Комментарий можно оставить у рецепта или у поста.
const commentSchema = new Schema(
  {
    targetType: {
      type: String,
      enum: ['recipe', 'post'],
      required: true,
      index: true,
    },
    targetId: {
      type: ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    parentCommentId: {
      type: ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
    },
    // Глубина нужна frontend, чтобы ограничить только визуальный отступ.
    depth: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true },
);

// Сначала показываем старые комментарии, а _id стабилизирует порядок при одинаковом времени.
commentSchema.index({ targetType: 1, targetId: 1, createdAt: 1, _id: 1 });

export const Comment = model('Comment', commentSchema);
