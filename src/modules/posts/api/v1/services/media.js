import { resolveUserAvatar } from '#modules/users/api/v1/services/media.js';

export async function resolvePostMedia(post) {
  return {
    ...post,
    authorId: await resolveUserAvatar(post.authorId),
  };
}
