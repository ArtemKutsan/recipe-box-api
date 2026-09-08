/**
 * Здесь ищутся типы питания и кухни из справочников.
 * Например, с фронтенда приходит строка `dinner`, а рецепт в базе хранит внутренний Mongo id.
 * Эти функции находят запись типа питания или кухни и возвращают её, чтобы рецепт можно было
 * отфильтровать, создать или обновить с правильной связью.
 * Принимает: slug, например `'dinner'` или `'italian'`, либо массив slug для нескольких типов.
 * Возвращает: найденный документ справочника или id и названия найденных типов питания.
 * Пример: `resolveRecipeCuisine('italian')` возвращает запись кухни Italian.
 */
import { MealType } from '#db/models/MealType.js';
import { Cuisine } from '#db/models/Cuisine.js';
import { buildNotFoundError } from './utils.js';
import { normalizeSlug } from '#utils/strings.js';

// Находим один тип блюда по slug и возвращаем документ справочника.
export async function resolveRecipeMealType(mealTypeValue) {
  const mealTypeSlug = normalizeSlug(mealTypeValue);
  const mealType = await MealType.findOne({ slug: mealTypeSlug, isActive: true });

  if (!mealType) {
    buildNotFoundError('Meal type not found.', 'MEAL_TYPE_NOT_FOUND');
  }

  return mealType;
}

// Находим типы блюда по slug и возвращаем id для Mongo-связей.
export async function resolveRecipeMealTypes(mealType) {
  const mealTypeSlugs = [...new Set(mealType.map(normalizeSlug))];
  const mealTypes = await MealType.find({
    slug: { $in: mealTypeSlugs },
    isActive: true,
  });

  if (mealTypes.length !== mealTypeSlugs.length) {
    buildNotFoundError('One or more meal types were not found.', 'MEAL_TYPE_NOT_FOUND');
  }

  const mealTypeBySlug = new Map(mealTypes.map((item) => [item.slug, item]));
  const mealTypeIds = mealTypeSlugs.map((slug) => mealTypeBySlug.get(slug)._id);
  const mealTypeTitles = mealTypeSlugs.map((slug) => mealTypeBySlug.get(slug).title);

  return {
    mealTypeIds,
    mealTypeTitles,
  };
}

// Находим кухню по slug и возвращаем документ справочника.
export async function resolveRecipeCuisine(cuisineValue) {
  const cuisineSlug = normalizeSlug(cuisineValue);
  const cuisine = await Cuisine.findOne({ slug: cuisineSlug, isActive: true });

  if (!cuisine) {
    buildNotFoundError('Cuisine not found.', 'CUISINE_NOT_FOUND');
  }

  return cuisine;
}

// Находим все справочники рецепта по slug и возвращаем готовые связи для сохранения.
export async function resolveRecipeDictionaries(payload) {
  const { mealTypeIds, mealTypeTitles } = await resolveRecipeMealTypes(payload.mealType);
  const cuisine = await resolveRecipeCuisine(payload.cuisine);

  return {
    mealTypeIds,
    mealTypeTitles,
    cuisine,
  };
}
