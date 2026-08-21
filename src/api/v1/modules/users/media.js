import { createDownloadUrl } from '../uploads/service.js';

// Для S3-аватара возвращаем временную ссылку, старую внешнюю ссылку не меняем.
export async function resolveUserAvatar(user) {
  if (!user?.avatarKey) {
    return user;
  }

  const { downloadUrl } = await createDownloadUrl(user.avatarKey);

  return {
    ...(typeof user.toObject === 'function' ? user.toObject() : user),
    avatarUrl: downloadUrl,
  };
}
