import mongoose from 'mongoose';
import { connectMongo } from '#db/providers/mongo.js';
import { MealType } from '#modules/meal-types/model.js';
import { Cuisine } from '#modules/cuisines/model.js';

const mealTypes = [
  { title: 'Appetizer', slug: 'appetizer', order: 10 },
  { title: 'Beverage', slug: 'beverage', order: 20 },
  { title: 'Breakfast', slug: 'breakfast', order: 30 },
  { title: 'Lunch', slug: 'lunch', order: 40 },
  { title: 'Dinner', slug: 'dinner', order: 50 },
  { title: 'Side Dish', slug: 'side-dish', order: 60 },
  { title: 'Snack', slug: 'snack', order: 70 },
  { title: 'Dessert', slug: 'dessert', order: 80 },
];

const cuisines = [
  { title: 'Italian', slug: 'italian', order: 10 },
  { title: 'Asian', slug: 'asian', order: 20 },
  { title: 'American', slug: 'american', order: 30 },
  { title: 'Brazilian', slug: 'brazilian', order: 40 },
  { title: 'Cocktail', slug: 'cocktail', order: 50 },
  { title: 'Greek', slug: 'greek', order: 60 },
  { title: 'Hawaiian', slug: 'hawaiian', order: 70 },
  { title: 'Indian', slug: 'indian', order: 80 },
  { title: 'Japanese', slug: 'japanese', order: 90 },
  { title: 'Korean', slug: 'korean', order: 100 },
  { title: 'Lebanese', slug: 'lebanese', order: 110 },
  { title: 'Mediterranean', slug: 'mediterranean', order: 120 },
  { title: 'Mexican', slug: 'mexican', order: 130 },
  { title: 'Moroccan', slug: 'moroccan', order: 140 },
  { title: 'Pakistani', slug: 'pakistani', order: 150 },
  { title: 'Russian', slug: 'russian', order: 160 },
  { title: 'Smoothie', slug: 'smoothie', order: 170 },
  { title: 'Spanish', slug: 'spanish', order: 180 },
  { title: 'Thai', slug: 'thai', order: 190 },
  { title: 'Turkish', slug: 'turkish', order: 200 },
  { title: 'Vietnamese', slug: 'vietnamese', order: 210 },
];

async function upsertDictionaryItems(Model, items) {
  // Функция проходит по списку справочника и для каждого slug либо обновляет
  // существующую запись, либо создаёт новую. Так seed можно запускать повторно
  // без дублей и без сброса recipesCount у уже существующих записей.
  await Promise.all(
    items.map((item) =>
      Model.updateOne(
        { slug: item.slug },
        {
          $set: {
            ...item,
            isActive: true,
          },
          $setOnInsert: {
            recipesCount: 0,
          },
        },
        { upsert: true }
      )
    )
  );
}

async function seedRecipeDictionaries() {
  await connectMongo();

  await upsertDictionaryItems(MealType, mealTypes);
  await upsertDictionaryItems(Cuisine, cuisines);

  console.log('Recipe dictionaries seed completed.');
}

try {
  await seedRecipeDictionaries();
} catch (error) {
  console.error('Recipe dictionaries seed failed.');
  console.error(error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
