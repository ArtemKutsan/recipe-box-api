export default function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;

  res.status(status).json({
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Unexpected error',
    },
  });
}
