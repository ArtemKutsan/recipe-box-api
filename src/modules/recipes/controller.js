import { createRecipe, deleteRecipe, getRecipeByPublicId, getRecipes, updateRecipe } from './service.js';
import { validateCreateRecipe, validateUpdateRecipe } from './validation.js';

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
    const result = await getRecipeByPublicId(req.params.id);

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

export async function update(req, res, next) {
  try {
    // Обновлять рецепт может только владелец с валидным JWT.
    validateUpdateRecipe(req.body);
    const result = await updateRecipe(req.params.id, req.body, req.authUser);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    // Удалять рецепт может только владелец с валидным JWT.
    const result = await deleteRecipe(req.params.id, req.authUser);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
