import mongoose from 'mongoose';
import { getNextSequence } from '#db/services/counter.js';
import { Post } from '#db/models/Post.js';
import { Recipe } from '#db/models/Recipe.js';
import { resolveUserAvatar } from '../users/media.js';
import { buildNotFoundError } from '../recipes/shared/utils.js';
import {
  DEFAULT_POSTS_PAGE,
  DEFAULT_POSTS_PAGE_SIZE,
  MAX_POSTS_PAGE_SIZE,
} from './constants.js';
import { toPostResponse } from './response.js';
import { parsePositiveInteger } from '#utils/numbers.js';

function parsePostPublicId(value) {
  const publicId = Number(value);

  if (!Number.isInteger(publicId) || publicId < 1) {
    buildNotFoundError('Post not found.', 'POST_NOT_FOUND');
  }

  return publicId;
}

async function findPublicRecipe(recipeId) {
  if (recipeId === null || recipeId === undefined || recipeId === '') {
    return null;
  }

  const publicId = Number(recipeId);

  if (!Number.isInteger(publicId) || publicId < 1) {
    buildNotFoundError('Recipe not found.', 'RECIPE_NOT_FOUND');
  }

  const recipe = await Recipe.findOne({
    publicId,
    $or: [{ visibility: 'public' }, { visibility: { $exists: false } }],
  })
    .select('_id publicId title')
    .lean();

  if (!recipe) {
    buildNotFoundError('Public recipe not found.', 'RECIPE_NOT_FOUND');
  }

  return recipe;
}

export async function buildPostResponse(post) {
  const author = await resolveUserAvatar(post.authorId);

  return toPostResponse({ ...post, authorId: author });
}

async function populatePost(postId) {
  const post = await Post.findById(postId)
    .populate('authorId', 'publicId name avatarUrl avatarKey')
    .populate('recipeId', 'publicId title')
    .lean();

  if (!post) {
    buildNotFoundError('Post not found.', 'POST_NOT_FOUND');
  }

  return buildPostResponse(post);
}

async function getPostsByFilter(filter, query = {}) {
  const page = parsePositiveInteger(query.page, DEFAULT_POSTS_PAGE);
  const pageSize = parsePositiveInteger(
    query.pageSize,
    DEFAULT_POSTS_PAGE_SIZE,
    MAX_POSTS_PAGE_SIZE,
  );
  const skip = (page - 1) * pageSize;
  const [total, posts] = await Promise.all([
    Post.countDocuments(filter),
    Post.find(filter)
      .populate('authorId', 'publicId name avatarUrl avatarKey')
      .populate('recipeId', 'publicId title')
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
  ]);

  const items = await Promise.all(posts.map(buildPostResponse));

  return {
    items,
    page,
    pageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
  };
}

export function getPosts(query = {}) {
  return getPostsByFilter({}, query);
}

export function getPostsByAuthor(authorId, query = {}) {
  return getPostsByFilter({ authorId }, query);
}

export async function getPostByPublicId(value) {
  const publicId = parsePostPublicId(value);
  const post = await Post.findOne({ publicId }).select('_id').lean();

  if (!post) {
    buildNotFoundError('Post not found.', 'POST_NOT_FOUND');
  }

  return { post: await populatePost(post._id) };
}

export async function createPost(payload, author) {
  const recipe = await findPublicRecipe(payload.recipeId);
  const session = await mongoose.startSession();

  try {
    let createdPost;

    await session.withTransaction(async () => {
      const publicId = await getNextSequence('posts', { session });
      [createdPost] = await Post.create(
        [
          {
            publicId,
            authorId: author._id,
            title: payload.title,
            body: payload.body,
            recipeId: recipe?._id ?? null,
          },
        ],
        { session },
      );
    });

    return { post: await populatePost(createdPost._id) };
  } finally {
    await session.endSession();
  }
}

async function findOwnedPost(publicId, author) {
  const post = await Post.findOne({ publicId, authorId: author._id }).select('_id').lean();

  if (!post) {
    buildNotFoundError('Post not found.', 'POST_NOT_FOUND');
  }

  return post;
}

export async function updatePost(value, payload, author) {
  const publicId = parsePostPublicId(value);
  const post = await findOwnedPost(publicId, author);
  const update = {};

  if (payload.title !== undefined) {
    update.title = payload.title;
  }

  if (payload.body !== undefined) {
    update.body = payload.body;
  }

  if (payload.recipeId !== undefined) {
    const recipe = await findPublicRecipe(payload.recipeId);
    update.recipeId = recipe?._id ?? null;
  }

  await Post.updateOne({ _id: post._id }, { $set: update });

  return { post: await populatePost(post._id) };
}

export async function deletePost(value, author) {
  const publicId = parsePostPublicId(value);
  const post = await findOwnedPost(publicId, author);

  await Post.deleteOne({ _id: post._id });

  return { id: publicId };
}
