import { createComment, getComments } from './service.js';
import { validateCreateComment } from './validation.js';

export async function list(req, res, next) {
  try {
    const result = await getComments('recipe', req.params.recipeId, req.query);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const payload = validateCreateComment(req.body);
    const result = await createComment('recipe', req.params.recipeId, payload, req.authUser);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
