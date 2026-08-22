function toPostAuthorResponse(author) {
  if (!author) {
    return null;
  }

  return {
    id: author.publicId,
    name: author.name,
    avatarUrl: author.avatarUrl ?? null,
  };
}

function toPostRecipeResponse(recipe) {
  if (!recipe) {
    return null;
  }

  return {
    id: recipe.publicId,
    title: recipe.title,
  };
}

export function toPostResponse(post) {
  return {
    id: post.publicId,
    title: post.title,
    body: post.body,
    author: toPostAuthorResponse(post.authorId),
    recipe: toPostRecipeResponse(post.recipeId),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}
