// Здесь появятся проверки формы тела запроса для auth-операций.
export function validateRegister(payload) {
  const body = payload || {};
  const errors = [];

  if (!body.name || typeof body.name !== 'string') {
    errors.push('name is required');
  }

  if (!body.email || typeof body.email !== 'string') {
    errors.push('email is required');
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.push('password is required');
  }

  if (errors.length > 0) {
    const error = new Error('Validation failed');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = errors;
    throw error;
  }

  return [];
}

export function validateLogin(_payload) {
  return [];
}
