import { Counter } from './model.js';

export async function getNextSequence(name, options = {}) {
  // Атомарно увеличиваем счётчик, чтобы параллельные регистрации не получили один номер.
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { value: 1 } },
    { new: true, upsert: true, session: options.session }
  );

  return counter.value;
}
