import { getFeed } from './service.js';

export async function list(req, res, next) {
  try {
    return res.status(200).json(await getFeed(req.query));
  } catch (error) {
    next(error);
  }
}
