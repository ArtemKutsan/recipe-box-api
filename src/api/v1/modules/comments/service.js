import { Comment } from '#db/models/Comment.js';
import { Post } from '#db/models/Post.js';
import { Recipe } from '#db/models/Recipe.js';
import mongoose from 'mongoose';
import { resolveUserAvatar } from '#modules/users/api/v1/media.js';
import { buildNotFoundError, parseRecipePublicId } from '#modules/recipes/api/v1/shared/utils.js';
import {
  DEFAULT_COMMENTS_PAGE,
  DEFAULT_COMMENTS_PAGE_SIZE,
  MAX_COMMENTS_PAGE_SIZE,
} from './constants.js';
import { toCommentResponse } from './response.js';
import { parsePositiveInteger } from '#utils/numbers.js';
import {
  createCommentCreatedNotification,
  createCommentRepliedNotification,
} from '../notifications/service.js';

async function findPublicTarget(targetType, targetId) {
  if (targetType === 'recipe') {
    const publicId = parseRecipePublicId(targetId);
    const recipe = await Recipe.findOne({
      publicId,
      $or: [{ visibility: 'public' }, { visibility: { $exists: false } }],
    })
      .select('_id authorId')
      .lean();

    if (!recipe) {
      buildNotFoundError('Recipe not found.', 'RECIPE_NOT_FOUND');
    }

    return {
      targetType,
      targetId: recipe._id,
      targetPublicId: publicId,
      targetAuthorId: recipe.authorId,
    };
  }

  if (targetType === 'post') {
    const publicId = Number(targetId);

    if (!Number.isInteger(publicId) || publicId < 1) {
      buildNotFoundError('Post not found.', 'POST_NOT_FOUND');
    }

    const post = await Post.findOne({ publicId }).select('_id authorId').lean();

    if (!post) {
      buildNotFoundError('Post not found.', 'POST_NOT_FOUND');
    }

    return {
      targetType,
      targetId: post._id,
      targetPublicId: publicId,
      targetAuthorId: post.authorId,
    };
  }

  buildNotFoundError('Comment target not found.', 'COMMENT_TARGET_NOT_FOUND');
}

async function buildCommentResponse(comment) {
  const author = await resolveUserAvatar(comment.userId);

  return toCommentResponse({ ...comment, userId: author });
}

async function findCommentParent(parentCommentId, target) {
  if (!parentCommentId) {
    return null;
  }

  if (!mongoose.isValidObjectId(parentCommentId)) {
    const error = new Error('parentCommentId must be a valid comment id.');
    error.status = 400;
    error.code = 'INVALID_PARENT_COMMENT_ID';
    throw error;
  }

  const parent = await Comment.findOne({
    _id: parentCommentId,
    targetType: target.targetType,
    targetId: target.targetId,
  })
    .select('_id depth userId')
    .lean();

  if (!parent) {
    buildNotFoundError('Parent comment not found.', 'PARENT_COMMENT_NOT_FOUND');
  }

  return parent;
}

async function loadCommentThread(target, roots) {
  const comments = [...roots];
  let parentIds = roots.map((comment) => comment._id);

  while (parentIds.length > 0) {
    const replies = await Comment.find({
      targetType: target.targetType,
      targetId: target.targetId,
      parentCommentId: { $in: parentIds },
    })
      // Внутри ветки сохраняем обычный порядок разговора: старые ответы выше новых.
      .sort({ createdAt: 1, _id: 1 })
      .lean();

    comments.push(...replies);
    parentIds = replies.map((comment) => comment._id);
  }

  const commentsWithAuthors = await Comment.find({
    _id: { $in: comments.map((comment) => comment._id) },
  })
    .populate('userId', 'publicId name avatarUrl avatarKey')
    .lean();
  const commentsById = new Map(
    commentsWithAuthors.map((comment) => [comment._id.toString(), comment]),
  );

  return Promise.all(
    comments.map((comment) => buildCommentResponse(commentsById.get(comment._id.toString()))),
  );
}

export async function getComments(targetType, targetId, query = {}) {
  const target = await findPublicTarget(targetType, targetId);
  const page = parsePositiveInteger(query.page, DEFAULT_COMMENTS_PAGE, Number.MAX_SAFE_INTEGER);
  const pageSize = parsePositiveInteger(
    query.pageSize,
    DEFAULT_COMMENTS_PAGE_SIZE,
    MAX_COMMENTS_PAGE_SIZE,
  );
  const skip = (page - 1) * pageSize;
  const [roots, rootTotal, total] = await Promise.all([
    Comment.find({ targetType: target.targetType, targetId: target.targetId, parentCommentId: null })
      // Новые основные комментарии показываем первыми.
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Comment.countDocuments({
      targetType: target.targetType,
      targetId: target.targetId,
      parentCommentId: null,
    }),
    Comment.countDocuments({
      targetType: target.targetType,
      targetId: target.targetId,
    }),
  ]);

  return {
    items: await loadCommentThread(target, roots),
    total,
    rootTotal,
    page,
    pageSize,
    totalPages: Math.ceil(rootTotal / pageSize),
  };
}

export async function createComment(targetType, targetId, payload, user) {
  const target = await findPublicTarget(targetType, targetId);
  const parent = await findCommentParent(payload.parentCommentId, target);
  const comment = await Comment.create({
    targetType: target.targetType,
    targetId: target.targetId,
    userId: user._id,
    parentCommentId: parent?._id ?? null,
    depth: parent ? parent.depth + 1 : 0,
    body: payload.body,
  });

  if (parent) {
    await createCommentRepliedNotification({
      recipientId: parent.userId,
      actorId: user._id,
      commentId: comment._id,
      contextType: target.targetType,
      contextPublicId: target.targetPublicId,
    });
  } else {
    await createCommentCreatedNotification({
      recipientId: target.targetAuthorId,
      actorId: user._id,
      commentId: comment._id,
      contextType: target.targetType,
      contextPublicId: target.targetPublicId,
    });
  }

  const populatedComment = await Comment.findById(comment._id)
    .populate('userId', 'publicId name avatarUrl avatarKey')
    .lean();

  return { comment: await buildCommentResponse(populatedComment) };
}
