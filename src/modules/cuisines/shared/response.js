// Приводим кухню к публичному формату ответа.
export function toCuisineResponse(cuisine) {
  return {
    title: cuisine.title,
    slug: cuisine.slug,
    recipesCount: cuisine.recipesCount,
  };
}
