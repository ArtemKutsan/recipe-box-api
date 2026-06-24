import { Counter } from './model.js';

export async function getNextSequence(name) {
  // Атомарно увеличиваем счётчик, чтобы параллельные регистрации не получили один номер.
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  return counter.value;
}
