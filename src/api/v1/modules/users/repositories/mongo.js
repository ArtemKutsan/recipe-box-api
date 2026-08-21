import { User } from '#db/models/User.js';

// Ищем пользователя по email.
export function findUserByEmail(email, options = {}) {
  return User.findOne({ email }, options.projection ?? null, { session: options.session });
}

// Ищем пользователя по короткому публичному номеру профиля.
export function findUserByPublicId(publicId, options = {}) {
  return User.findOne({ publicId }, options.projection ?? null, { session: options.session });
}

// Ищем пользователя по внутреннему MongoDB _id.
export function findUserById(id, options = {}) {
  return User.findById(id, options.projection ?? null, { session: options.session });
}

// Создаём пользователя, при необходимости внутри переданной транзакции.
export function createUser(data, options = {}) {
  return User.create(data, { session: options.session });
}
