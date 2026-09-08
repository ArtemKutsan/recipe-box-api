import config from '#config/index.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Ошибка для запроса без Origin или с Origin другого frontend-домена.
function buildForbiddenError() {
  const error = new Error('Request origin is not allowed.');
  error.status = 403;
  error.code = 'CSRF_ORIGIN_INVALID';
  return error;
}

// Проверяем Origin изменяющих запросов до того, как они попадут в API-маршрут.
export default function verifyRequestOrigin(req, _res, next) {
  // GET только читает данные, а OPTIONS нужен браузеру для CORS preflight.
  // Эти методы не меняют данные, поэтому проверка Origin для них не нужна.
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  // Браузер передаёт сюда адрес страницы, с которой отправлен запрос.
  const requestOrigin = req.get('origin');

  // Для POST, PATCH, PUT и DELETE Origin обязателен и должен совпадать
  // с адресом frontend из CLIENT_ORIGIN.
  if (requestOrigin && requestOrigin === config.app.clientOrigin) {
    return next();
  }

  // Чужой или отсутствующий Origin означает, что источник запроса не подтверждён.
  return next(buildForbiddenError());
}
