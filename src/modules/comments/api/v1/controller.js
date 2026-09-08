import { createComment, getComments } from './service.js';
import { validateCreateComment } from './validation.js';

function createCommentHandlers(targetType, paramName) {
  return {
    list: async (req, res, next) => {
      try {
        const result = await getComments(targetType, req.params[paramName], req.query);

        return res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    },
    create: async (req, res, next) => {
      try {
        const payload = validateCreateComment(req.body);
        const result = await createComment(
          targetType,
          req.params[paramName],
          payload,
          req.authUser,
        );

        return res.status(201).json(result);
      } catch (error) {
        next(error);
      }
    },
  };
}

export const recipeCommentHandlers = createCommentHandlers('recipe', 'recipeId');
export const postCommentHandlers = createCommentHandlers('post', 'postId');
