import { z } from 'zod';

// ---- Request Schemas ----

export const MacroGoalsSchema = z.object({
  calories: z.number().min(0).optional(),
  protein: z.number().min(0).describe('grams'),
  carbohydrates: z.number().min(0).describe('grams'),
  fats: z.number().min(0).describe('grams'),
  fiber: z.number().min(0).describe('grams'),
});

export const MealPlanRequestSchema = z.object({
  macroGoals: MacroGoalsSchema,
  dietaryRestrictions: z.array(z.string()).default([]),
  favoriteCuisines: z.array(z.string()).default([]),
  specificMeals: z.array(z.string()).default([]),
  excludePreviousWeekMeals: z.boolean().default(false),
  previousWeekMeals: z.array(z.string()).default([]),
  additionalContext: z.string().default(''),
});

// ---- Domain Types ----

export type MacroGoals = z.infer<typeof MacroGoalsSchema>;
export type MealPlanRequest = z.infer<typeof MealPlanRequestSchema>;

export interface Meal {
  name: string;
  description: string;
  ingredients: Ingredient[];
  macros: MacroGoals;
  prepTime: string;
}

export interface DayPlan {
  day: string;
  breakfast: Meal;
  morningSnack: Meal;
  lunch: Meal;
  afternoonSnack: Meal;
  dinner: Meal;
  dailyTotals: MacroGoals;
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  category: GroceryCategory;
}

export type GroceryCategory =
  | 'Produce'
  | 'Dairy'
  | 'Meat & Seafood'
  | 'Bakery'
  | 'Frozen'
  | 'Pantry'
  | 'Beverages'
  | 'Spices & Seasonings'
  | 'Other';

export interface ShoppingListItem {
  name: string;
  totalQuantity: string;
  unit: string;
  category: GroceryCategory;
}

export interface ShoppingList {
  items: ShoppingListItem[];
}

export interface MealPlanResponse {
  weekPlan: DayPlan[];
  shoppingList: ShoppingList;
  generatedAt: string;
}
