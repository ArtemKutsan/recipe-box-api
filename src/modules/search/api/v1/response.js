export function toRecipeSearchResponse(recipe) {
  return {
    id: recipe.publicId,
    title: recipe.title,
    thumbnailUrl: recipe.thumbnailUrl ?? null,
    cuisine: recipe.cuisineId?.title ?? null,
  };
}

export function toPostSearchResponse(post) {
  return {
    id: post.publicId,
    title: post.title,
    body: post.body,
    author: post.authorId
      ? {
          id: post.authorId.publicId,
          name: post.authorId.name,
          avatarUrl: post.authorId.avatarUrl ?? null,
        }
      : null,
    createdAt: post.createdAt,
    recipe: post.recipeId
      ? {
          id: post.recipeId.publicId,
          title: post.recipeId.title,
        }
      : null,
  };
}

export function toUserSearchResponse(user) {
  return {
    id: user.publicId,
    name: user.name,
    avatarUrl: user.avatarUrl ?? null,
  };
}
