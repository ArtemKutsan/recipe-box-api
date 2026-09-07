import { getCurrentUserNotifications, markNotificationAsRead } from './service.js';

export async function list(req, res, next) {
  try {
    const result = await getCurrentUserNotifications(req.query, req.authUser);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function markRead(req, res, next) {
  try {
    await markNotificationAsRead(req.params.notificationId, req.authUser);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
