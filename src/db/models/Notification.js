import { model, Schema } from 'mongoose';
import {
  NOTIFICATION_ENTITY_TYPES,
  NOTIFICATION_ENTITY_MODELS,
  NOTIFICATION_TYPES,
} from '#modules/notifications/constants.js';

const { ObjectId } = Schema.Types;

// Notification хранит одно адресное уведомление для конкретного пользователя.
const notificationSchema = new Schema(
  {
    // Пользователь, которому нужно показать уведомление.
    recipientId: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    // Пользователь, который выполнил действие.
    actorId: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    // Например, пользователь добавил рецепт в Favorites.
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    // Объект, к которому относится уведомление.
    entityType: {
      type: String,
      enum: NOTIFICATION_ENTITY_TYPES,
      required: true,
    },
    entityId: {
      type: ObjectId,
      refPath: 'entityModel',
      required: true,
    },
    // Mongoose использует это имя, чтобы понять, какую модель подставить в entityId.
    entityModel: {
      type: String,
      enum: Object.values(NOTIFICATION_ENTITY_MODELS),
      required: true,
    },
    // Для ответа на комментарий сохраняем публичную страницу, где находится комментарий.
    context: {
      type: {
        type: String,
        enum: ['recipe', 'post'],
        default: null,
      },
      publicId: {
        type: Number,
        default: null,
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Список уведомлений пользователя показываем от новых к старым.
notificationSchema.index({ recipientId: 1, createdAt: -1, _id: -1 });
// Быстро находим непрочитанные уведомления для счётчика.
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const Notification = model('Notification', notificationSchema, 'notifications');
