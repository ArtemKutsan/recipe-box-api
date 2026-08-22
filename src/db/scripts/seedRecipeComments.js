import mongoose from 'mongoose';
import { connectMongo } from '#db/providers/mongo.js';
import { Comment } from '#db/models/Comment.js';
import { Recipe } from '#db/models/Recipe.js';
import { User } from '#db/models/User.js';

const demoComments = [
  { userIndex: 0, body: 'I made this for dinner and it turned out great.' },
  { userIndex: 1, parentIndex: 0, body: 'Same here, I added a little more basil.' },
  { userIndex: 2, parentIndex: 1, body: 'That sounds good, I will try it next time.' },
  { userIndex: 3, parentIndex: 2, body: 'I also used fresh mozzarella.' },
  { userIndex: 4, parentIndex: 3, body: 'This thread is now deeper than the visual indent.' },
  { userIndex: 5, body: 'The preparation time was accurate for me.' },
  { userIndex: 6, parentIndex: 5, body: 'It took me a few minutes longer.' },
  { userIndex: 7, body: 'The ingredients are simple and easy to find.' },
  { userIndex: 8, parentIndex: 7, body: 'Agreed, this is a good weekday recipe.' },
  { userIndex: 9, body: 'I would definitely cook this again.' },
];

async function seedRecipeComments() {
  await connectMongo();

  const recipe = await Recipe.findOne({ publicId: 1 }).select('_id visibility').lean();

  if (!recipe) {
    throw new Error('Recipe with publicId 1 was not found.');
  }

  if (recipe.visibility && recipe.visibility !== 'public') {
    throw new Error('Recipe with publicId 1 must be public for comment demo data.');
  }

  const users = await User.find({}).sort({ publicId: 1 }).limit(11).select('_id publicId name').lean();

  if (users.length < 10) {
    throw new Error('At least 10 users are required for comment demo data.');
  }

  await Comment.deleteMany({
    targetType: 'recipe',
    targetId: recipe._id,
    body: { $in: demoComments.map(({ body }) => body) },
  });

  const createdComments = [];
  const now = Date.now();

  for (const [index, item] of demoComments.entries()) {
    const parent = item.parentIndex === undefined ? null : createdComments[item.parentIndex];
    const depth = parent ? parent.depth + 1 : 0;
    const createdAt = new Date(now - (demoComments.length - index) * 60 * 60 * 1000);
    const comment = await Comment.create({
      targetType: 'recipe',
      targetId: recipe._id,
      userId: users[item.userIndex]._id,
      parentCommentId: parent?._id ?? null,
      depth,
      body: item.body,
      createdAt,
      updatedAt: createdAt,
    });

    createdComments.push(comment);
  }

  console.log(`Recipe comments seed completed. Created: ${createdComments.length}.`);
}

try {
  await seedRecipeComments();
} catch (error) {
  console.error('Recipe comments seed failed.');
  console.error(error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
