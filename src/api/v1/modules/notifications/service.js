import { Notification } from '#db/models/Notification.js';

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
    entityId: recipeId,
  });
}
