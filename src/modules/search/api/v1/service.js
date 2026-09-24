import { Post } from '#db/models/Post.js';
import { Recipe } from '#db/models/Recipe.js';
import { User } from '#db/models/User.js';
import { resolvePostMedia } from '#modules/posts/api/v1/services/media.js';
import { resolveRecipeMedia } from '#modules/recipes/api/v1/services/media.js';
import { resolveUserAvatar } from '#modules/users/api/v1/services/media.js';
import { toPostSearchResponse, toRecipeSearchResponse, toUserSearchResponse } from './response.js';

const RESULT_LIMIT = 5;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildPublicRecipeFilter() {
  return { $or: [{ visibility: 'public' }, { visibility: { $exists: false } }] };
}

export async function search(value = '') {
  const query = String(value ?? '').trim();

  if (query.length < 2) {
    return { query, recipes: [], posts: [], users: [] };
  }

  const pattern = new RegExp(escapeRegex(query), 'i');
  const [recipes, posts, users] = await Promise.all([
    Recipe.find({ $and: [buildPublicRecipeFilter(), { title: pattern }] })
      .populate('authorId', 'publicId name')
      .populate('mealTypeIds', 'title')
      .populate('cuisineId', 'title')
      .sort({ title: 1, _id: 1 })
      .limit(RESULT_LIMIT)
      .lean(),
    Post.find({ $or: [{ title: pattern }, { body: pattern }] })
      .populate('authorId', 'publicId name avatarUrl avatarKey')
      .populate('recipeId', 'publicId title')
      .sort({ createdAt: -1, _id: -1 })
      .limit(RESULT_LIMIT)
      .lean(),
    User.find({ name: pattern })
      .select('publicId name avatarUrl avatarKey')
      .sort({ name: 1, _id: 1 })
      .limit(RESULT_LIMIT)
      .lean(),
  ]);

  const recipesWithMedia = await Promise.all(recipes.map(resolveRecipeMedia));
  const postsWithMedia = await Promise.all(posts.map(resolvePostMedia));
  const usersWithMedia = await Promise.all(users.map(resolveUserAvatar));

  return {
    query,
    recipes: recipesWithMedia.map(toRecipeSearchResponse),
    posts: postsWithMedia.map(toPostSearchResponse),
    users: usersWithMedia.map(toUserSearchResponse),
  };
}
