// Типы уведомлений, которые могут появиться в backend.
export const NOTIFICATION_TYPES = ['recipe_favorited'];

// Тип сущности отделён от имени Mongoose-модели, чтобы их можно было менять независимо.
export const NOTIFICATION_ENTITY_MODELS = {
  recipe: 'Recipe',
  post: 'Post',
  comment: 'Comment',
};

export const NOTIFICATION_ENTITY_TYPES = Object.keys(NOTIFICATION_ENTITY_MODELS);
