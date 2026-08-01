import { getCuisines } from './service.js';

export async function getCuisinesList(_req, res, next) {
  try {
    // Возвращаем справочник кухонь для фильтров рецептов.
    const result = await getCuisines();

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
