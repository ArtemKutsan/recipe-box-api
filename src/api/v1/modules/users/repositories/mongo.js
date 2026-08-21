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
export async function createUser(data, options = {}) {
  // User.create() поддерживает два варианта:
  // User.create(doc) и несколько документов:
  // User.create(doc1, doc2, doc3).
  // Поэтому User.create(data, { session: options.session }) не означает
  // автоматически: создай data, а второй объект используй как options.
  // Mongoose может понять это как создание двух документов: data и
  // { session: options.session }. Тогда session проверяется как поле User,
  // и возникают ошибки валидации.
  //
  // Массив нужен, чтобы убрать эту неоднозначность:
  // const [user] = await User.create(
  //   [data],
  //   { session: options.session },
  // );
  // Первый аргумент-массив - документы, второй аргумент - options.
  // Это особенность API Mongoose Model.create(), а не правило MongoDB
  // и не отдельное требование транзакций.
  // Для одного документа save() понятнее: data точно документ, а session
  // точно настройка сохранения.
  const user = new User(data);

  await user.save({ session: options.session });

  return user;
}
