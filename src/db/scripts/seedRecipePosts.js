import mongoose from 'mongoose';
import { Post } from '#db/models/Post.js';
import { Recipe } from '#db/models/Recipe.js';
import { User } from '#db/models/User.js';
import { getNextSequence } from '#db/services/counter.js';
import { connectMongo } from '#db/providers/mongo.js';

const demoPosts = [
  {
    title: 'A simple weeknight dinner',
    body: 'I made this after work and liked how little preparation it needed. The recipe was easy to follow, and the leftovers were still good the next day.',
    recipeIndex: 0,
  },
  {
    title: 'A better sauce after simmering',
    body: 'The sauce tasted much better after I let it simmer a little longer. Next time I would prepare the sauce first and cook the rest of the meal while it thickens.',
    recipeIndex: 1,
  },
  {
    title: 'A quick recipe for busy days',
    body: 'This worked well for a busy evening because the ingredients were already in my kitchen. I would keep this recipe in the rotation for simple weekday meals.',
    recipeIndex: 2,
  },
  {
    title: 'A useful ingredient swap',
    body: 'I replaced one ingredient with what I had at home and the result was still balanced. It is a good reminder that the recipe can be adapted without changing the whole idea.',
    recipeIndex: 3,
  },
  {
    title: 'A small cooking question',
    body: 'How do you usually adjust the seasoning when cooking for more people? I tend to add less at the beginning and correct it near the end.',
    recipeIndex: null,
  },
  {
    title: 'Even better as leftovers',
    body: 'The flavors became deeper after resting overnight. I packed the leftovers for lunch and the texture held up better than I expected.',
    recipeIndex: 4,
  },
  {
    title: 'Good for cooking for guests',
    body: 'I would make this again for guests because the preparation is straightforward. Most of the work can be done before everyone arrives, which makes serving easier.',
    recipeIndex: 5,
  },
  {
    title: 'A thought about kitchen routines',
    body: 'I have been trying to plan fewer complicated meals during the week and leave new experiments for the weekend. That change makes cooking feel much more relaxed.',
    recipeIndex: null,
  },
  {
    title: 'An idea for more vegetables',
    body: 'This inspired me to try a lighter version with more vegetables and a smaller portion of the heavier ingredients. I will compare both versions next time.',
    recipeIndex: 7,
  },
  {
    title: 'A practical weekly meal plan idea',
    body: 'A practical meal does not need many ingredients or complicated steps. I would pair this kind of recipe with a fresh salad and use the leftovers for lunch.',
    recipeIndex: null,
  },
];

const legacyDemoBodies = [
  'I made this recipe for a weeknight dinner and it was easy to prepare.',
  'The sauce turned out better after I let it simmer a little longer.',
  'This is a good recipe to cook when I need something quick.',
  'I replaced one ingredient with what I had at home and it still worked well.',
  'The flavors were balanced and the leftovers were even better the next day.',
  'I would make this again for guests because the preparation is straightforward.',
  'The cooking time was accurate for my kitchen and equipment.',
  'This recipe gave me an idea for a lighter version with more vegetables.',
  'I saved this combination because it works well for a simple lunch.',
  'A practical recipe that is easy to add to a weekly meal plan.',
];

function getDemoPostDate(timelineRecipes, index) {
  const newerRecipeDate = timelineRecipes[index]?.createdAt?.getTime();
  const olderRecipeDate = timelineRecipes[index + 1]?.createdAt?.getTime();

  if (newerRecipeDate && olderRecipeDate && newerRecipeDate > olderRecipeDate) {
    return new Date((newerRecipeDate + olderRecipeDate) / 2);
  }

  const referenceDate = timelineRecipes[0]?.createdAt?.getTime() ?? Date.now();
  const offsetFromMiddle = Math.floor(demoPosts.length / 2) - index;

  return new Date(referenceDate + offsetFromMiddle * 60 * 60 * 1000);
}

async function setPostDate(postId, date) {
  await Post.collection.updateOne(
    { _id: postId },
    { $set: { createdAt: date, updatedAt: date } },
  );
}

async function seedRecipePosts() {
  await connectMongo();

  const users = await User.find({}).sort({ publicId: 1 }).select('_id publicId').lean();
  const recipes = await Recipe.find({
    $or: [{ visibility: 'public' }, { visibility: { $exists: false } }],
  })
    .sort({ publicId: 1 })
    .limit(demoPosts.length)
    .select('_id publicId')
    .lean();
  const timelineRecipes = await Recipe.find({
    $or: [{ visibility: 'public' }, { visibility: { $exists: false } }],
  })
    .sort({ createdAt: -1, _id: -1 })
    .limit(demoPosts.length + 1)
    .select('createdAt')
    .lean();

  if (users.length === 0) {
    throw new Error('At least one user is required for post demo data.');
  }

  // Удаляем только старые тексты этого seed, если они остались после прошлой версии.
  await Post.deleteMany({ body: { $in: legacyDemoBodies } });

  let createdCount = 0;
  let updatedCount = 0;

  for (const [index, item] of demoPosts.entries()) {
    const author = users[index % users.length];
    const recipe = recipes[item.recipeIndex] ?? null;
    const createdAt = getDemoPostDate(timelineRecipes, index);
    const existingPost = await Post.findOne({ body: item.body }).select('_id').lean();

    if (existingPost) {
      await Post.updateOne(
        { _id: existingPost._id },
        {
          $set: {
            authorId: author._id,
            title: item.title,
            recipeId: recipe?._id ?? null,
          },
        },
      );
      await setPostDate(existingPost._id, createdAt);
      updatedCount += 1;
      continue;
    }

    const publicId = await getNextSequence('posts');

    const createdPost = await Post.create({
      publicId,
      authorId: author._id,
      title: item.title,
      body: item.body,
      recipeId: recipe?._id ?? null,
    });
    await setPostDate(createdPost._id, createdAt);
    createdCount += 1;
  }

  console.log(
    `Recipe posts seed completed. Created: ${createdCount}. Updated: ${updatedCount}.`,
  );
}

try {
  await seedRecipePosts();
} catch (error) {
  console.error('Recipe posts seed failed.');
  console.error(error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
