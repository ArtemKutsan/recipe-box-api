import { Schema } from 'mongoose';
import { MEAL_PLAN_DAYS, MEAL_PLAN_PERIODS } from './constants.js';

const { ObjectId } = Schema.Types;

const createMealPeriodSchemaDefinition = () =>
  Object.fromEntries(
    MEAL_PLAN_PERIODS.map((mealPeriod) => [
      mealPeriod,
      {
        // В слотах храним публичный id рецепта из API, а не Mongo _id.
        type: Number,
        default: null,
        min: 1,
      },
    ])
  );

const slotsSchemaDefinition = Object.fromEntries(
  MEAL_PLAN_DAYS.map((day) => [day, createMealPeriodSchemaDefinition()])
);

export const mealPlanSchema = new Schema(
  {
    // У пользователя один постоянный недельный шаблон питания.
    userId: {
      type: ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    slots: {
      type: slotsSchemaDefinition,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);
