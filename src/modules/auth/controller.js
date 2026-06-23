import { loginUser, registerUser } from './service.js';
import { validateLogin, validateRegister } from './validation.js';

export async function register(req, res, next) {
  try {
    // Сначала валидируем тело запроса, потом отдаём данные в сервис.
    validateRegister(req.body);
    const result = await registerUser(req.body);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    // Логин идёт по той же схеме: проверка тела запроса и потом сервис.
    validateLogin(req.body);
    const result = await loginUser(req.body);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    // Текущий пользователь уже лежит в req.user после проверки middleware.
    return res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
}
