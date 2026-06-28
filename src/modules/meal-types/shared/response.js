// Приводим тип блюда к публичному формату ответа.
export function toMealTypeResponse(mealType) {
  return {
    title: mealType.title,
    slug: mealType.slug,
    recipesCount: mealType.recipesCount,
  };
}
