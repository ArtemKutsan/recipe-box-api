import mongoose from 'mongoose';
import { Notification } from '#db/models/Notification.js';
import { parsePositiveInteger } from '#utils/numbers.js';
import { NOTIFICATION_ENTITY_MODELS } from '#domain/notifications/constants.js';
import {
  DEFAULT_NOTIFICATIONS_PAGE,
  DEFAULT_NOTIFICATIONS_PAGE_SIZE,
  MAX_NOTIFICATIONS_PAGE_SIZE,
} from './constants.js';
import { toNotificationResponse } from './response.js';

function buildNotificationNotFoundError() {
  const error = new Error('Notification not found.');
  error.status = 404;
  error.code = 'NOTIFICATION_NOT_FOUND';
  return error;
}

// Создаём уведомление только для другого пользователя, а не для автора действия.
export async function createRecipeFavoritedNotification({ recipientId, actorId, recipeId }) {
  if (recipientId.toString() === actorId.toString()) {
    return null;
  }

  return Notification.create({
    recipientId,
    actorId,
    type: 'recipe_favorited',
    entityType: 'recipe',
    entityModel: NOTIFICATION_ENTITY_MODELS.recipe,
    entityId: recipeId,
  });
}

// Возвращаем сохранённые уведомления текущего пользователя от новых к старым.
export async function getCurrentUserNotifications(query = {}, user) {
  const page = parsePositiveInteger(query.page, DEFAULT_NOTIFICATIONS_PAGE);
  const pageSize = parsePositiveInteger(
    query.pageSize,
    DEFAULT_NOTIFICATIONS_PAGE_SIZE,
    MAX_NOTIFICATIONS_PAGE_SIZE,
  );
  const filter = { recipientId: user._id };
  const skip = (page - 1) * pageSize;
  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate('actorId', 'publicId name avatarUrl')
      .populate('entityId', 'publicId name title')
      .lean(),
    Notification.countDocuments(filter),
  ]);

  return {
    items: notifications.map(toNotificationResponse),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// Отмечаем уведомление прочитанным только для его получателя.
export async function markNotificationAsRead(notificationId, user) {
  if (!mongoose.isValidObjectId(notificationId)) {
    throw buildNotificationNotFoundError();
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    recipientId: user._id,
  }).select('isRead readAt');

  if (!notification) {
    throw buildNotificationNotFoundError();
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }
}
