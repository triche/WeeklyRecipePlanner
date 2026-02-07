import { MealPlanRequestSchema, RecipeRequestSchema } from './types';

describe('MealPlanRequestSchema', () => {
  it('should validate a complete valid request', () => {
    const validRequest = {
      macroGoals: {
        protein: 150,
        carbohydrates: 200,
        fats: 65,
        fiber: 30,
        calories: 2000,
      },
      dietaryRestrictions: ['vegetarian'],
      favoriteCuisines: ['Italian'],
      specificMeals: ['Greek Salad'],
      excludePreviousWeekMeals: true,
      previousWeekMeals: ['Pasta Carbonara'],
      additionalContext: 'I like spicy food',
    };

    const result = MealPlanRequestSchema.parse(validRequest);
    expect(result).toEqual(validRequest);
  });

  it('should apply defaults for optional fields', () => {
    const minimalRequest = {
      macroGoals: {
        protein: 100,
        carbohydrates: 150,
        fats: 50,
        fiber: 25,
      },
    };

    const result = MealPlanRequestSchema.parse(minimalRequest);
    expect(result.dietaryRestrictions).toEqual([]);
    expect(result.favoriteCuisines).toEqual([]);
    expect(result.specificMeals).toEqual([]);
    expect(result.excludePreviousWeekMeals).toBe(false);
    expect(result.previousWeekMeals).toEqual([]);
    expect(result.additionalContext).toBe('');
  });

  it('should reject negative macro values', () => {
    const invalidRequest = {
      macroGoals: {
        protein: -10,
        carbohydrates: 200,
        fats: 65,
        fiber: 30,
      },
    };

    expect(() => MealPlanRequestSchema.parse(invalidRequest)).toThrow();
  });

  it('should reject missing required macro fields', () => {
    const invalidRequest = {
      macroGoals: {
        protein: 150,
      },
    };

    expect(() => MealPlanRequestSchema.parse(invalidRequest)).toThrow();
  });
});

describe('RecipeRequestSchema', () => {
  it('should validate a complete recipe request', () => {
    const validRequest = {
      mealName: 'Classic Oatmeal',
      mealDescription: 'Hearty oats with toppings',
      ingredients: [{ name: 'Oats', quantity: '1', unit: 'cup' }],
      prepTime: '10 min',
      dietaryRestrictions: ['vegetarian'],
      favoriteCuisines: ['Italian'],
      macros: { protein: 10, carbohydrates: 40, fats: 5, fiber: 6, calories: 250 },
    };

    const result = RecipeRequestSchema.parse(validRequest);
    expect(result.mealName).toBe('Classic Oatmeal');
    expect(result.ingredients).toHaveLength(1);
  });

  it('should apply defaults for optional fields', () => {
    const minimal = { mealName: 'Toast' };
    const result = RecipeRequestSchema.parse(minimal);
    expect(result.mealDescription).toBe('');
    expect(result.ingredients).toEqual([]);
    expect(result.prepTime).toBe('');
    expect(result.dietaryRestrictions).toEqual([]);
    expect(result.favoriteCuisines).toEqual([]);
  });

  it('should reject empty mealName', () => {
    expect(() => RecipeRequestSchema.parse({ mealName: '' })).toThrow();
  });

  it('should reject missing mealName', () => {
    expect(() => RecipeRequestSchema.parse({})).toThrow();
  });
});
