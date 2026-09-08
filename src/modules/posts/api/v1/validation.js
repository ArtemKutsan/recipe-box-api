import { MAX_POST_BODY_LENGTH, MAX_POST_TITLE_LENGTH } from './constants.js';

function throwValidationError(details) {
  const error = new Error('Validation failed.');
  error.status = 400;
  error.code = 'VALIDATION_ERROR';
  error.details = details;
  throw error;
}

function validatePostPayload(payload, { partial = false } = {}) {
  const data = payload ?? {};
  const errors = [];

  if (!partial || data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length === 0) {
      errors.push('title is required.');
    } else if (data.title.trim().length > MAX_POST_TITLE_LENGTH) {
      errors.push(`title must be no longer than ${MAX_POST_TITLE_LENGTH} characters.`);
    }
  }

  if (!partial || data.body !== undefined) {
    if (typeof data.body !== 'string' || data.body.trim().length === 0) {
      errors.push('body is required.');
    } else if (data.body.trim().length > MAX_POST_BODY_LENGTH) {
      errors.push(`body must be no longer than ${MAX_POST_BODY_LENGTH} characters.`);
    }
  }

  if (data.recipeId !== undefined && data.recipeId !== null && typeof data.recipeId !== 'number' && typeof data.recipeId !== 'string') {
    errors.push('recipeId must be a public recipe id or null.');
  }

  if (errors.length > 0) {
    throwValidationError(errors);
  }

  return {
    ...(data.title !== undefined ? { title: data.title.trim() } : {}),
    ...(data.body !== undefined ? { body: data.body.trim() } : {}),
    ...(data.recipeId !== undefined ? { recipeId: data.recipeId } : {}),
  };
}

export function validateCreatePost(payload) {
  return validatePostPayload(payload);
}

export function validateUpdatePost(payload) {
  const data = payload ?? {};
  const supportedFields = ['title', 'body', 'recipeId'];
  const unsupportedFields = Object.keys(data).filter((field) => !supportedFields.includes(field));

  if (unsupportedFields.length > 0) {
    throwValidationError([`unsupported fields: ${unsupportedFields.join(', ')}`]);
  }

  if (Object.keys(data).length === 0) {
    throwValidationError(['request body must include at least one field.']);
  }

  return validatePostPayload(data, { partial: true });
}
