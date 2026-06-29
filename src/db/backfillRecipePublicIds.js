import mongoose from 'mongoose';
import { connectMongo } from '#db/providers/mongo.js';
import { Recipe } from '#modules/recipes/model.js';
import { Counter } from '#shared/counters/model.js';
import { getNextSequence } from '#shared/counters/service.js';

async function backfillRecipePublicIds() {
  await connectMongo();

  const [maxRecipe] = await Recipe.find({ publicId: { $exists: true, $ne: null } })
    .sort({ publicId: -1 })
    .limit(1)
    .select('publicId')
    .lean();

  // Сначала синхронизируем счетчик с уже существующими publicId, чтобы не выдать дубль.
  await Counter.findByIdAndUpdate(
    'recipes',
    { $max: { value: maxRecipe?.publicId ?? 0 } },
    { upsert: true }
  );

  const recipesWithoutPublicId = await Recipe.find({
    $or: [{ publicId: { $exists: false } }, { publicId: null }],
  }).sort({ createdAt: 1, _id: 1 });

  for (const recipe of recipesWithoutPublicId) {
    // Каждому старому рецепту выдаём следующий короткий публичный номер.
    recipe.publicId = await getNextSequence('recipes');
    await recipe.save();
  }

  console.log(`Recipe publicId backfill completed. Updated: ${recipesWithoutPublicId.length}.`);
}

try {
  await backfillRecipePublicIds();
} catch (error) {
  console.error('Recipe publicId backfill failed.');
  console.error(error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
