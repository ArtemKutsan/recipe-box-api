import mongoose from 'mongoose';
import { Notification } from '#db/models/Notification.js';
import { Post } from '#db/models/Post.js';
import { Recipe } from '#db/models/Recipe.js';
import { parsePositiveInteger } from '#utils/numbers.js';
import { NOTIFICATION_ENTITY_MODELS } from '#domain/notifications/constants.js';
import {
  DEFAULT_NOTIFICATIONS_PAGE,
  DEFAULT_NOTIFICATIONS_PAGE_SIZE,
  MAX_NOTIFICATIONS_PAGE_SIZE,
} from './constants.js';
import { toNotificationResponse } from './response.js';
import { emitToUser } from '#integrations/socket-io/gateway.js';

function buildNotificationNotFoundError() {
  const error = new Error('Notification not found.');
  error.status = 404;
  error.code = 'NOTIFICATION_NOT_FOUND';
  return error;
}

async function resolveNotificationContext(notification) {
  const context = notification.context;

  if (!context?.type || !context.publicId) {
    return null;
  }

  const Model = context.type === 'recipe' ? Recipe : Post;
  const target = await Model.findOne({ publicId: context.publicId }).select('title name').lean();

  return {
    type: context.type,
    publicId: context.publicId,
    title: target?.title ?? target?.name ?? null,
  };
}

async function buildNotificationResponse(notification) {
  return toNotificationResponse(notification, await resolveNotificationContext(notification));
}

// Создаём уведомление только для другого пользователя, а не для автора действия.
export async function createRecipeFavoritedNotification({ recipientId, actorId, recipeId }) {
  if (recipientId.toString() === actorId.toString()) {
    return null;
  }

  const notification = await Notification.create({
    recipientId,
    actorId,
    type: 'recipe_favorited',
    entityType: 'recipe',
    entityModel: NOTIFICATION_ENTITY_MODELS.recipe,
    entityId: recipeId,
  });

  await notification.populate([
    { path: 'actorId', select: 'publicId name avatarUrl' },
    { path: 'entityId', select: 'publicId name title' },
  ]);

  const notificationResponse = await buildNotificationResponse(notification);
  emitToUser(recipientId.toString(), 'notification:new', notificationResponse);

  return notificationResponse;
}

// Уведомляем автора комментария о прямом ответе на него.
export async function createCommentRepliedNotification({
  recipientId,
  actorId,
  commentId,
  contextType,
  contextPublicId,
}) {
  if (recipientId.toString() === actorId.toString()) {
    return null;
  }

  const notification = await Notification.create({
    recipientId,
    actorId,
    type: 'comment_replied',
    entityType: 'comment',
    entityModel: NOTIFICATION_ENTITY_MODELS.comment,
    entityId: commentId,
    context: {
      type: contextType,
      publicId: contextPublicId,
    },
  });

  await notification.populate([
    { path: 'actorId', select: 'publicId name avatarUrl' },
    { path: 'entityId', select: 'publicId name title' },
  ]);

  const notificationResponse = await buildNotificationResponse(notification);
  emitToUser(recipientId.toString(), 'notification:new', notificationResponse);

  return notificationResponse;
}

// Уведомляем автора рецепта или поста о новом корневом комментарии.
export async function createCommentCreatedNotification({
  recipientId,
  actorId,
  commentId,
  contextType,
  contextPublicId,
}) {
  if (recipientId.toString() === actorId.toString()) {
    return null;
  }

  const notification = await Notification.create({
    recipientId,
    actorId,
    type: 'comment_created',
    entityType: 'comment',
    entityModel: NOTIFICATION_ENTITY_MODELS.comment,
    entityId: commentId,
    context: {
      type: contextType,
      publicId: contextPublicId,
    },
  });

  await notification.populate([
    { path: 'actorId', select: 'publicId name avatarUrl' },
    { path: 'entityId', select: 'publicId name title' },
  ]);

  const notificationResponse = await buildNotificationResponse(notification);
  emitToUser(recipientId.toString(), 'notification:new', notificationResponse);

  return notificationResponse;
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
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate('actorId', 'publicId name avatarUrl')
      .populate('entityId', 'publicId name title')
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, isRead: false }),
  ]);

  return {
    items: await Promise.all(notifications.map(buildNotificationResponse)),
    total,
    unreadCount,
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

// Отмечаем все уведомления только текущего пользователя.
export async function markAllNotificationsAsRead(user) {
  await Notification.updateMany(
    { recipientId: user._id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } },
  );
}
