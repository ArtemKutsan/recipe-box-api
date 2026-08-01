function getMongooseValidationDetails(error) {
  return Object.values(error.errors ?? {})
    .map((validationError) => validationError?.message)
    .filter(Boolean);
}

// Приводим ожидаемые ошибки MongoDB и Mongoose к публичным HTTP-ошибкам API.
function normalizeDatabaseError(error) {
  if (error?.code === 11000) {
    return {
      status: 409,
      code: 'DUPLICATE_RESOURCE',
      message: 'Resource already exists.',
    };
  }

  if (error?.name === 'ValidationError') {
    return {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed.',
      details: getMongooseValidationDetails(error),
    };
  }

  if (error?.name === 'CastError') {
    return {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Invalid request value.',
    };
  }

  return null;
}

export default function errorHandler(error, _req, res, _next) {
  const normalizedError = error.status
    ? {
        status: error.status,
        code: error.code,
        message: error.message,
        details: error.details,
      }
    : normalizeDatabaseError(error);
  const status = normalizedError?.status ?? 500;
  const responseError = {
    code: normalizedError?.code || 'INTERNAL_SERVER_ERROR',
    message: normalizedError?.message || 'Unexpected error',
  };

  if (Array.isArray(normalizedError?.details) && normalizedError.details.length > 0) {
    responseError.details = normalizedError.details;
  }

  res.status(status).json({
    error: responseError,
  });
}
