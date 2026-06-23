import { getPublicUserProfile } from './service.js';

export async function getPublicProfile(req, res, next) {
  try {
    // Берём id из URL и отдаём публичный профиль.
    const result = await getPublicUserProfile(req.params.id);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
