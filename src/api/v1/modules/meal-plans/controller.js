import { getCurrentMealPlan, updateCurrentMealPlanSlot } from './service.js';
import { validateUpdateMealPlanSlot } from './validation.js';

export async function getCurrent(req, res, next) {
  try {
    // Возвращаем текущий план питания пользователя по JWT.
    const result = await getCurrentMealPlan(req.authUser);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateCurrentSlot(req, res, next) {
  try {
    // Меняем только один слот и сразу возвращаем обновленный план.
    validateUpdateMealPlanSlot(req.body);
    const result = await updateCurrentMealPlanSlot(req.body, req.authUser);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
