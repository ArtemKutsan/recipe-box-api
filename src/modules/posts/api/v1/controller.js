import {
  createPost,
  deletePost,
  getPostByPublicId,
  getPosts,
  updatePost,
} from './service.js';
import { validateCreatePost, validateUpdatePost } from './validation.js';

export async function list(req, res, next) {
  try {
    return res.status(200).json(await getPosts(req.query));
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    return res.status(200).json(await getPostByPublicId(req.params.id));
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const payload = validateCreatePost(req.body);

    return res.status(201).json(await createPost(payload, req.authUser));
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const payload = validateUpdatePost(req.body);

    return res.status(200).json(await updatePost(req.params.id, payload, req.authUser));
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    return res.status(200).json(await deletePost(req.params.id, req.authUser));
  } catch (error) {
    next(error);
  }
}
