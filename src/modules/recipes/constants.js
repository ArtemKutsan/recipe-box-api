// Допустимые значения сложности рецепта.
export const RECIPE_DIFFICULTIES = ['easy', 'medium', 'hard'];

// Сообщение об ошибке держим рядом с правилами, чтобы не дублировать строку.
export const RECIPE_DIFFICULTY_ERROR = 'difficulty must be one of easy, medium, hard';

// Базовые значения пагинации списка рецептов.
export const RECIPE_LIST_DEFAULT_PAGE = 1;
export const RECIPE_LIST_DEFAULT_PAGE_SIZE = 20;
export const RECIPE_LIST_MAX_PAGE_SIZE = 100;

// Список полей, по которым backend разрешает сортировать список рецептов.
export const RECIPE_LIST_SORT_FIELDS = ['createdAt', 'title', 'prepTimeMinutes', 'cookTimeMinutes'];
