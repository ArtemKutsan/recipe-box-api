import { createRecipe, getRecipeById, getRecipes } from './service.js';
import { validateCreateRecipe } from './validation.js';

export async function list(req, res, next) {
  try {
    // Список рецептов строим из query-параметров и возвращаем пагинированный ответ.
    const result = await getRecipes(req.query);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    // Детали рецепта берем по id из URL и возвращаем готовый DTO.
    const result = await getRecipeById(req.params.id);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

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
