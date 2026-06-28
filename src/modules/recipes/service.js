import mongoose from 'mongoose';
import { Recipe } from './model.js';
import { RECIPE_DIFFICULTIES, RECIPE_DIFFICULTY_ERROR } from './constants.js';
import { MealType } from '#modules/meal-types/model.js';
import { Cuisine } from '#modules/cuisines/model.js';

const ALLOWED_DIFFICULTIES = new Set(RECIPE_DIFFICULTIES);
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const ALLOWED_SORT_FIELDS = new Set(['createdAt', 'title', 'prepTimeMinutes', 'cookTimeMinutes']);

// TODO: потом вынести в helper
// Нормализуем строку для сравнения по slug.
function normalizeSlug(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-');
}

// TODO: потом вынести в helper
// Убираем пустые элементы и лишние пробелы из массивов строк.
function normalizeStringArray(value = []) {
  return value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
}

// Возвращаем только публичные данные автора рецепта.
function toRecipeAuthorDto(author) {
  if (!author) {
    return null;
  }

  return {
    id: author.publicId ?? author.id ?? author._id?.toString(),
    name: author.name,
  };
}

// Собираем детальный ответ для создания рецепта.
function toRecipeDetailDto(recipe, mealTypeTitles, cuisine, author) {
  return {
    id: recipe._id.toString(),
    title: recipe.title,
    description: recipe.description,
    mealType: mealTypeTitles,
    tags: recipe.tags,
    cuisine: cuisine.title,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    thumbnailUrl: recipe.thumbnailUrl,
    images: recipe.images,
    author: toRecipeAuthorDto(author),
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
  };
}

// TODO: потом вынести в helper?
// Собираем короткий ответ для списка рецептов.
function toRecipeListDto(recipe) {
  return {
    id: recipe._id.toString(),
    title: recipe.title,
    mealType: Array.isArray(recipe.mealTypeIds)
      ? recipe.mealTypeIds.map((item) => item.title).filter(Boolean)
      : [],
    tags: recipe.tags ?? [],
    cuisine: recipe.cuisineId?.title ?? null,
    rating: recipe.rating ?? null,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    thumbnailUrl: recipe.thumbnailUrl,
    author: toRecipeAuthorDto(recipe.authorId),
  };
}

// Собираем детальный ответ из найденного рецепта с уже подгруженными связями.
function toRecipeDetailFromRecipe(recipe) {
  const mealTypeTitles = Array.isArray(recipe.mealTypeIds)
    ? recipe.mealTypeIds.map((item) => item.title).filter(Boolean)
    : [];

  return toRecipeDetailDto(
    recipe,
    mealTypeTitles,
    recipe.cuisineId ?? { title: null },
    recipe.authorId,
  );
}

// Формируем ошибку 404 в одном месте.
function buildNotFoundError(message, code) {
  const error = new Error(message);
  error.status = 404;
  error.code = code;
  throw error;
}

// Приводим число из query к безопасному положительному значению.
function parsePositiveInteger(value, fallback, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseInt(String(value ?? ''), 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, max);
}

// Определяем направление сортировки.
function normalizeSortOrder(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase() === 'asc'
    ? 1
    : -1;
}

// Собираем сортировку только из разрешенных полей.
function buildSort(query) {
  const sortBy = ALLOWED_SORT_FIELDS.has(String(query.sortBy ?? '').trim())
    ? String(query.sortBy).trim()
    : 'createdAt';
  const sortOrder = normalizeSortOrder(query.sortOrder);

  return { [sortBy]: sortOrder };
}

// Превращаем query-параметры в Mongo-фильтр.
async function buildRecipeListFilter(query) {
  const filter = {};
  const searchValue = typeof query.q === 'string' ? query.q.trim() : '';
  const tagValue = typeof query.tag === 'string' ? query.tag.trim() : '';
  const mealTypeValue = typeof query.mealType === 'string' ? query.mealType.trim() : '';
  const cuisineValue = typeof query.cuisine === 'string' ? query.cuisine.trim() : '';

  if (searchValue) {
    filter.$text = { $search: searchValue };
  }

  if (tagValue) {
    filter.tags = tagValue;
  }

  if (mealTypeValue) {
    const mealTypeSlug = normalizeSlug(mealTypeValue);
    const mealType = await MealType.findOne({ slug: mealTypeSlug, isActive: true }).select('_id');

    if (!mealType) {
      buildNotFoundError('Meal type not found.', 'MEAL_TYPE_NOT_FOUND');
    }

    filter.mealTypeIds = mealType._id;
  }

  if (cuisineValue) {
    const cuisineSlug = normalizeSlug(cuisineValue);
    const cuisine = await Cuisine.findOne({ slug: cuisineSlug, isActive: true }).select('_id');

    if (!cuisine) {
      buildNotFoundError('Cuisine not found.', 'CUISINE_NOT_FOUND');
    }

    filter.cuisineId = cuisine._id;
  }

  return filter;
}

export async function createRecipe(payload, author) {
  const mealTypeSlugs = [...new Set(payload.mealType.map(normalizeSlug))];
  const cuisineSlug = normalizeSlug(payload.cuisine);
  const tags = normalizeStringArray(payload.tags);
  const ingredients = normalizeStringArray(payload.ingredients);
  const instructions = normalizeStringArray(payload.instructions);
  const images = normalizeStringArray(payload.images);
  const difficulty = payload.difficulty
    ? String(payload.difficulty).trim().toLowerCase()
    : 'medium';

  if (!ALLOWED_DIFFICULTIES.has(difficulty)) {
    const error = new Error(RECIPE_DIFFICULTY_ERROR);
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = [RECIPE_DIFFICULTY_ERROR];
    throw error;
  }

  const mealTypes = await MealType.find({
    slug: { $in: mealTypeSlugs },
    isActive: true,
  });

  if (mealTypes.length !== mealTypeSlugs.length) {
    buildNotFoundError('One or more meal types were not found.', 'MEAL_TYPE_NOT_FOUND');
  }

  const cuisine = await Cuisine.findOne({ slug: cuisineSlug, isActive: true });

  if (!cuisine) {
    buildNotFoundError('Cuisine not found.', 'CUISINE_NOT_FOUND');
  }

  const mealTypeBySlug = new Map(mealTypes.map((item) => [item.slug, item]));
  const mealTypeIds = mealTypeSlugs.map((slug) => mealTypeBySlug.get(slug)._id);
  const mealTypeTitles = mealTypeSlugs.map((slug) => mealTypeBySlug.get(slug).title);

  const session = await mongoose.startSession();

  try {
    let createdRecipe = null;

    // Все операции ниже должны пройти вместе, иначе Mongo откатит их.
    await session.withTransaction(async () => {
      // Создаем сам рецепт в рамках текущей транзакции.
      const [recipe] = await Recipe.create(
        [
          {
            authorId: author._id,
            title: payload.title.trim(),
            description: typeof payload.description === 'string' ? payload.description.trim() : '',
            mealTypeIds,
            cuisineId: cuisine._id,
            tags,
            ingredients,
            instructions,
            prepTimeMinutes: Number(payload.prepTimeMinutes),
            cookTimeMinutes: Number(payload.cookTimeMinutes),
            servings: Number(payload.servings),
            difficulty,
            images,
            thumbnailUrl:
              typeof payload.thumbnailUrl === 'string' && payload.thumbnailUrl.trim()
                ? payload.thumbnailUrl.trim()
                : null,
          },
        ],
        { session },
      );

      createdRecipe = recipe;

      // Обновляем счетчики справочников в том же транзакционном блоке.
      await MealType.updateMany(
        { _id: { $in: mealTypeIds } },
        { $inc: { recipesCount: 1 } },
        { session },
      );

      // То же самое делаем для кухни.
      await Cuisine.updateOne({ _id: cuisine._id }, { $inc: { recipesCount: 1 } }, { session });
    });

    return {
      recipe: toRecipeDetailDto(createdRecipe, mealTypeTitles, cuisine, author),
    };
  } finally {
    await session.endSession();
  }
}

export async function getRecipes(query = {}) {
  const page = parsePositiveInteger(query.page, DEFAULT_PAGE);
  const pageSize = parsePositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const filter = await buildRecipeListFilter(query);
  const sort = buildSort(query);
  const skip = (page - 1) * pageSize;

  const [total, recipes] = await Promise.all([
    Recipe.countDocuments(filter),
    Recipe.find(filter)
      .populate('authorId', 'publicId name')
      .populate('mealTypeIds', 'title')
      .populate('cuisineId', 'title')
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .lean(),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  return {
    items: recipes.map(toRecipeListDto),
    page,
    pageSize,
    total,
    totalPages,
  };
}

export async function getRecipeById(recipeId) {
  if (!mongoose.isValidObjectId(recipeId)) {
    buildNotFoundError('Recipe not found.', 'RECIPE_NOT_FOUND');
  }

  const recipe = await Recipe.findById(recipeId)
    .populate('authorId', 'publicId name')
    .populate('mealTypeIds', 'title')
    .populate('cuisineId', 'title')
    .lean();

  if (!recipe) {
    buildNotFoundError('Recipe not found.', 'RECIPE_NOT_FOUND');
  }

  return {
    recipe: toRecipeDetailFromRecipe(recipe),
  };
}
