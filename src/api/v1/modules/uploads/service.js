import { randomUUID } from 'node:crypto';
import { Recipe } from '#db/models/Recipe.js';
import { User } from '#db/models/User.js';
import {
  createPresignedDownload,
  deleteStoredObject,
  createPresignedUpload,
} from '#integrations/storage/s3.js';

export async function createUploadUrl(payload, user) {
  const fileKey = `${payload.folder}/${user._id.toString()}/${randomUUID()}.${payload.extension}`;
  const result = await createPresignedUpload({
    fileKey,
    contentType: payload.contentType,
    sizeBytes: payload.sizeBytes,
  });

  return {
    ...result,
    fileKey,
    contentType: payload.contentType,
    sizeBytes: payload.sizeBytes,
  };
}

export function createDownloadUrl(fileKey) {
  return createPresignedDownload(fileKey);
}

// Ошибка очистки не должна отменять уже сохранённую новую ссылку.
export async function deleteMediaObject(fileKey) {
  if (!fileKey) {
    return;
  }

  try {
    await deleteStoredObject(fileKey);
  } catch (error) {
    console.error('Failed to delete old media object.', { fileKey, error });
  }
}

function buildMediaNotFoundError() {
  const error = new Error('Media file not found.');
  error.status = 404;
  error.code = 'MEDIA_NOT_FOUND';
  return error;
}

function isRecipeOwner(recipe, user) {
  return Boolean(user?._id && recipe.authorId && String(recipe.authorId) === String(user._id));
}

async function ensureRecipeMediaAccess(fileKey, user) {
  const recipe = await Recipe.findOne({
    $or: [{ thumbnailKey: fileKey }, { thumbnailUrl: fileKey }, { images: fileKey }],
  }).select('authorId visibility');

  if (!recipe) {
    throw buildMediaNotFoundError();
  }

  const isPublic = !recipe.visibility || recipe.visibility === 'public';

  if (!isPublic && !isRecipeOwner(recipe, user)) {
    throw buildMediaNotFoundError();
  }
}

async function ensureAvatarMediaAccess(fileKey) {
  const user = await User.findOne({ $or: [{ avatarKey: fileKey }, { avatarUrl: fileKey }] }).select('_id');

  if (!user) {
    throw buildMediaNotFoundError();
  }
}

export async function getMediaDownloadUrl(fileKey, user) {
  if (fileKey.startsWith('recipes/')) {
    await ensureRecipeMediaAccess(fileKey, user);
  } else {
    await ensureAvatarMediaAccess(fileKey);
  }

  const result = await createDownloadUrl(fileKey);

  return {
    ...result,
    fileKey,
  };
}
