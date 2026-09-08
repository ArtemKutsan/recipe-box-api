import { isEmailLike } from '#utils/strings.js';

// Общий helper для ошибок валидации auth-запросов.
function buildValidationError(errors) {
  const error = new Error('Validation failed');
  error.status = 400;
  error.code = 'VALIDATION_ERROR';
  error.details = errors;
  return error;
}

// Проверяем данные для регистрации.
export function validateRegister(payload) {
  const body = payload || {};
  const errors = [];

  // Для регистрации проверяем обязательные поля и их базовый формат.
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    errors.push('name must be at least 2 characters long');
  }

  if (!body.email || typeof body.email !== 'string' || !isEmailLike(body.email.trim())) {
    errors.push('email must be a valid email address');
  }

  if (!body.password || typeof body.password !== 'string' || body.password.length < 8) {
    errors.push('password must be at least 8 characters long');
  }

  if (errors.length > 0) {
    throw buildValidationError(errors);
  }

  return [];
}

// Проверяем данные для входа.
export function validateLogin(payload) {
  const body = payload || {};
  const errors = [];

  // Для логина проверяем email и пароль в том же базовом формате.
  if (!body.email || typeof body.email !== 'string' || !isEmailLike(body.email.trim())) {
    errors.push('email must be a valid email address');
  }

  if (!body.password || typeof body.password !== 'string' || body.password.length < 8) {
    errors.push('password must be at least 8 characters long');
  }

  if (errors.length > 0) {
    throw buildValidationError(errors);
  }

  return [];
}
