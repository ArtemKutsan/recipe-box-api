import { getMealTypes } from './service.js';

export async function getMealTypesList(_req, res, next) {
  try {
    // Возвращаем справочник типов блюда для фильтров рецептов.
    const result = await getMealTypes();

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
