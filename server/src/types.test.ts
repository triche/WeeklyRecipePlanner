import { MealPlanRequestSchema } from './types';

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
