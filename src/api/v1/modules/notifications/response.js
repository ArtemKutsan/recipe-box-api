function toActorResponse(actor) {
  if (!actor) {
    return null;
  }

  return {
    id: actor.publicId,
    name: actor.name,
    avatarUrl: actor.avatarUrl ?? null,
  };
}

function toEntityResponse(entity) {
  if (!entity) {
    return null;
  }

  return {
    id: entity.publicId ?? entity._id.toString(),
    name: entity.name ?? entity.title ?? null,
  };
}

export function toNotificationResponse(notification) {
  return {
    id: notification._id.toString(),
    type: notification.type,
    entityType: notification.entityType,
    actor: toActorResponse(notification.actorId),
    entity: toEntityResponse(notification.entityId),
    context: notification.context?.type
      ? {
          type: notification.context.type,
          publicId: notification.context.publicId,
        }
      : null,
    isRead: notification.isRead,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
  };
}
