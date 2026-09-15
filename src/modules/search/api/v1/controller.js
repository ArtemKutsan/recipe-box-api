import { search } from './service.js';

export async function list(req, res, next) {
  try {
    return res.status(200).json(await search(req.query.q));
  } catch (error) {
    next(error);
  }
}
