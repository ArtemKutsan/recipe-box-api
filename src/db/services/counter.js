import { Counter } from '../models/Counter.js';

export async function getNextSequence(name, options = {}) {
  // Атомарно увеличиваем счётчик, чтобы параллельные запросы не получили один номер.
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { value: 1 } },
    { new: true, upsert: true, session: options.session },
  );

  return counter.value;
}
