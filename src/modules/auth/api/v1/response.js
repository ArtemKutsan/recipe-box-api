// Приводим пользователя к публичному формату ответа auth API.
export function toUserResponse(user) {
  return {
    id: user.publicId,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    age: user.age ?? null,
    gender: user.gender ?? null,
    phone: user.phone ?? null,
    createdAt: user.createdAt,
  };
}
