// Приводим пользователя к публичному формату профиля.
export function toPublicUserResponse(user) {
  return {
    id: user.publicId,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
  };
}
