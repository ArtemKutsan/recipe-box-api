import { Schema, model } from 'mongoose';
import {
  MEAL_PLAN_DAYS,
  MEAL_PLAN_PERIODS,
  createEmptyMealPlanSlots,
} from '#modules/meal-plans/constants.js';

const { ObjectId } = Schema.Types;

const createMealPeriodSchemaDefinition = () => ({
  // В слотах храним публичный id рецепта из API, а не Mongo _id.
  type: Number,
  default: null,
  min: 1,
});

const createDaySchemaDefinition = () =>
  Object.fromEntries(
    MEAL_PLAN_PERIODS.map((mealPeriod) => [mealPeriod, createMealPeriodSchemaDefinition()]),
  );

const slotsSchemaDefinition = Object.fromEntries(
  MEAL_PLAN_DAYS.map((day) => [day, createDaySchemaDefinition()]),
);

const slotsSchema = new Schema(slotsSchemaDefinition, { _id: false });

const mealPlanSchema = new Schema(
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
      type: slotsSchema,
      default: createEmptyMealPlanSlots,
    },
  },
  {
    timestamps: true,
  },
);

// Явно задаем имя коллекции, чтобы Mongoose не создал mealplans.
export const MealPlan = model('MealPlan', mealPlanSchema, 'mealPlans');
