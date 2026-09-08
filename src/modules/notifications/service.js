import { Notification } from '#db/models/Notification.js';
import { Post } from '#db/models/Post.js';
import { Recipe } from '#db/models/Recipe.js';
import { NOTIFICATION_ENTITY_MODELS } from '#domain/notifications/constants.js';
import { toNotificationResponse } from './response.js';
import { emitToUser } from '#integrations/socket-io/gateway.js';

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

export async function buildNotificationResponse(notification) {
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
