import { Post } from '#db/models/Post.js';
import { Recipe } from '#db/models/Recipe.js';
import { resolveRecipeThumbnail } from '../recipes/services/media.js';
import { toRecipeListResponse } from '../recipes/shared/response.js';
import { buildPostResponse } from '../posts/service.js';
import { parsePositiveInteger } from '#utils/numbers.js';
import {
  DEFAULT_FEED_PAGE,
  DEFAULT_FEED_PAGE_SIZE,
  MAX_FEED_PAGE_SIZE,
} from './constants.js';

function buildPublicRecipeFilter() {
  return {
    $or: [{ visibility: 'public' }, { visibility: { $exists: false } }],
  };
}

function compareFeedItems(first, second) {
  const dateDifference = new Date(second.publishedAt) - new Date(first.publishedAt);

  if (dateDifference !== 0) {
    return dateDifference;
  }

  return second.sortId.localeCompare(first.sortId);
}

async function buildRecipeFeedItem(recipe) {
  const resolvedRecipe = await resolveRecipeThumbnail(recipe);

  return {
    type: 'recipe',
    publishedAt: resolvedRecipe.createdAt,
    sortId: resolvedRecipe._id.toString(),
    recipe: toRecipeListResponse(resolvedRecipe),
  };
}

async function buildPostFeedItem(post) {
  return {
    type: 'post',
    publishedAt: post.createdAt,
    sortId: post._id.toString(),
    post: await buildPostResponse(post),
  };
}

export async function getFeed(query = {}) {
  const page = parsePositiveInteger(query.page, DEFAULT_FEED_PAGE);
  const pageSize = parsePositiveInteger(
    query.pageSize,
    DEFAULT_FEED_PAGE_SIZE,
    MAX_FEED_PAGE_SIZE,
  );
  const skip = (page - 1) * pageSize;
  const candidateLimit = skip + pageSize;
  const publicRecipeFilter = buildPublicRecipeFilter();

  const [recipeTotal, postTotal, recipes, posts] = await Promise.all([
    Recipe.countDocuments(publicRecipeFilter),
    Post.countDocuments(),
    Recipe.find(publicRecipeFilter)
      .populate('authorId', 'publicId name avatarUrl avatarKey')
      .populate('mealTypeIds', 'title')
      .populate('cuisineId', 'title')
      .sort({ createdAt: -1, _id: -1 })
      .limit(candidateLimit)
      .lean(),
    Post.find()
      .populate('authorId', 'publicId name avatarUrl avatarKey')
      .populate('recipeId', 'publicId title')
      .sort({ createdAt: -1, _id: -1 })
      .limit(candidateLimit)
      .lean(),
  ]);

  const [recipeItems, postItems] = await Promise.all([
    Promise.all(recipes.map(buildRecipeFeedItem)),
    Promise.all(posts.map(buildPostFeedItem)),
  ]);
  const allItems = [...recipeItems, ...postItems].sort(compareFeedItems);
  const items = allItems.slice(skip, skip + pageSize).map(({ sortId, ...item }) => item);
  const total = recipeTotal + postTotal;

  return {
    items,
    page,
    pageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
  };
}
