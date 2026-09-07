import { getCurrentUserNotifications } from './service.js';

export async function list(req, res, next) {
  try {
    const result = await getCurrentUserNotifications(req.query, req.authUser);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
