const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const CONTENT_TYPE_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const UPLOAD_PURPOSES = {
  avatar: 'avatars',
  recipe: 'recipes',
};

function throwValidationError(details) {
  const error = new Error('Validation failed.');
  error.status = 400;
  error.code = 'VALIDATION_ERROR';
  error.details = details;
  throw error;
}

// Проверяем только данные, которые нужны для временной ссылки загрузки.
export function validatePresignedUpload(payload) {
  const body = payload || {};
  const details = [];
  const purpose = String(body.purpose || '').trim().toLowerCase();
  const contentType = String(body.contentType || '').trim().toLowerCase();
  const sizeBytes = Number(body.sizeBytes);

  if (!UPLOAD_PURPOSES[purpose]) {
    details.push('purpose must be avatar or recipe');
  }

  if (!CONTENT_TYPE_EXTENSIONS[contentType]) {
    details.push('contentType must be image/jpeg, image/png, or image/webp');
  }

  if (!Number.isInteger(sizeBytes) || sizeBytes < 1 || sizeBytes > MAX_FILE_SIZE_BYTES) {
    details.push('sizeBytes must be an integer from 1 to 5242880');
  }

  if (details.length > 0) {
    throwValidationError(details);
  }

  return {
    purpose,
    contentType,
    sizeBytes,
    folder: UPLOAD_PURPOSES[purpose],
    extension: CONTENT_TYPE_EXTENSIONS[contentType],
  };
}
