// Shared types between client and server

export interface MacroGoals {
  calories?: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const ALL_DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export type MealSlot = 'breakfast' | 'morningSnack' | 'lunch' | 'afternoonSnack' | 'dinner';

export const ALL_MEAL_SLOTS: MealSlot[] = ['breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner'];

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  morningSnack: 'Morning Snack',
  lunch: 'Lunch',
  afternoonSnack: 'Afternoon Snack',
  dinner: 'Dinner',
};

export interface MealPlanRequest {
  macroGoals: MacroGoals;
  selectedDays: DayOfWeek[];
  selectedMeals: MealSlot[];
  dietaryRestrictions: string[];
  favoriteCuisines: string[];
  specificMeals: string[];
  excludePreviousWeekMeals: boolean;
  previousWeekMeals: string[];
  additionalContext: string;
}

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
  category: string;
}

export interface ShoppingListItem {
  name: string;
  totalQuantity: string;
  unit: string;
  category: string;
}

export interface ShoppingList {
  items: ShoppingListItem[];
}

export interface MealPlanResponse {
  weekPlan: DayPlan[];
  shoppingList: ShoppingList;
  generatedAt: string;
}

// ---- Recipe Detail Types ----

export interface RecipeRequest {
  mealName: string;
  mealDescription: string;
  ingredients: { name: string; quantity: string; unit: string }[];
  prepTime: string;
  dietaryRestrictions: string[];
  favoriteCuisines: string[];
  macros?: MacroGoals;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
  notes: string;
}

export interface RecipeResponse {
  mealName: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  tips: string;
  generatedAt: string;
}
