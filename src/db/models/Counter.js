import { Schema, model } from 'mongoose';

// Счётчик хранит последний выданный публичный номер для сущности.
const counterSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
    default: 0,
  },
});

// Модель нужна для атомарной выдачи publicId.
export const Counter = model('Counter', counterSchema);
