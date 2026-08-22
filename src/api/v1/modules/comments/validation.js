import { MAX_COMMENT_LENGTH } from './constants.js';

function buildValidationError(details) {
  const error = new Error('Validation failed');
  error.status = 400;
  error.code = 'VALIDATION_ERROR';
  error.details = details;
  return error;
}

export function validateCreateComment(payload) {
  const body = payload?.body;
  const parentCommentId = payload?.parentCommentId ?? null;
  const details = [];

  if (typeof body !== 'string' || body.trim().length === 0) {
    details.push('body must be a non-empty string');
  } else if (body.trim().length > MAX_COMMENT_LENGTH) {
    details.push(`body must be no longer than ${MAX_COMMENT_LENGTH} characters`);
  }

  if (details.length > 0) {
    throw buildValidationError(details);
  }

  return { body: body.trim(), parentCommentId };
}
