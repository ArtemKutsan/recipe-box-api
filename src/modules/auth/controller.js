import { getCurrentUser, loginUser, registerUser } from './service.js';
import { validateLogin, validateRegister } from './validation.js';

// Временный ответ, пока auth-логика не подключена к БД и JWT.
function sendNotImplemented(res) {
  return res.status(501).json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Auth is not implemented yet.',
    },
  });
}

export async function register(req, res, next) {
  try {
    // Сначала проверяем входные данные, потом вызываем сервисный слой.
    validateRegister(req.body);
    const result = await registerUser(req.body);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    // Логин будет использовать ту же схему: валидация, затем сервис.
    validateLogin(req.body);
    await loginUser(req.body);

    return sendNotImplemented(res);
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    // Этот хендлер позже будет читать пользователя из токена.
    await getCurrentUser(req);

    return sendNotImplemented(res);
  } catch (error) {
    next(error);
  }
}
