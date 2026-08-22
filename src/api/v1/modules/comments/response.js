function toCommentAuthorResponse(author) {
  if (!author) {
    return null;
  }

  return {
    id: author.publicId,
    name: author.name,
    avatarUrl: author.avatarUrl ?? null,
  };
}

export function toCommentResponse(comment) {
  return {
    id: comment._id.toString(),
    targetType: comment.targetType,
    targetId: comment.targetId.toString(),
    parentCommentId: comment.parentCommentId?.toString() ?? null,
    depth: comment.depth,
    body: comment.body,
    author: toCommentAuthorResponse(comment.userId),
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}
