import { createRecipe } from './service.js';
import { validateCreateRecipe } from './validation.js';

export async function create(req, res, next) {
  try {
    // Сначала валидируем запрос, потом создаём рецепт под текущим пользователем.
    validateCreateRecipe(req.body);
    const result = await createRecipe(req.body, req.authUser);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
