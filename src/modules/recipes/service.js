import mongoose from 'mongoose';
import { Recipe } from './model.js';
import { RECIPE_DIFFICULTIES, RECIPE_DIFFICULTY_ERROR } from './constants.js';
import { MealType } from '#modules/meal-types/model.js';
import { Cuisine } from '#modules/cuisines/model.js';
import { toUserDto } from '#modules/auth/service.js';

const ALLOWED_DIFFICULTIES = new Set(RECIPE_DIFFICULTIES);

// TODO: потом вынести в helper
function normalizeSlug(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-');
}

// TODO: потом вынести в helper
function normalizeStringArray(value = []) {
  return value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
}

function toRecipeDto(recipe, mealTypeTitles, cuisine, author) {
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
    author: toUserDto(author),
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
  };
}

// TODO: потом вынести в helper?
function buildNotFoundError(message, code) {
  const error = new Error(message);
  error.status = 404;
  error.code = code;
  throw error;
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
      recipe: toRecipeDto(createdRecipe, mealTypeTitles, cuisine, author),
    };
  } finally {
    await session.endSession();
  }
}
