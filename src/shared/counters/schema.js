import { Schema } from 'mongoose';

// Счётчик хранит последний выданный публичный номер для сущности.
export const counterSchema = new Schema({
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
