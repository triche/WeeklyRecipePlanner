import { OpenAIProvider } from './aiProvider';
import { MealPlanRequest, RecipeRequest } from '../types';

// Helper to access private members for mocking
function setClient(
  provider: OpenAIProvider,
  client: { responses: { create: jest.Mock } }
): void {
  Object.defineProperty(provider, 'client', { value: client, writable: true });
}

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    responses: {
      create: jest.fn(),
    },
  }));
});

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;

  beforeEach(() => {
    provider = new OpenAIProvider('test-key', 'gpt-5.2');
  });

  it('should be instantiable', () => {
    expect(provider).toBeDefined();
  });

  it('should throw when AI returns empty response', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      output_text: null,
    });

    // Access private client for mocking
    setClient(provider, {
      responses: { create: mockCreate },
    });

    const request: MealPlanRequest = {
      macroGoals: { protein: 150, carbohydrates: 200, fats: 65, fiber: 30 },
      dietaryRestrictions: [],
      favoriteCuisines: [],
      specificMeals: [],
      excludePreviousWeekMeals: false,
      previousWeekMeals: [],
      additionalContext: '',
    };

    await expect(provider.generateMealPlan(request)).rejects.toThrow(
      'No response received from AI model'
    );
  });

  it('should parse valid AI response and add generatedAt', async () => {
    const mockResponse = {
      weekPlan: [],
      shoppingList: { items: [] },
    };

    const mockCreate = jest.fn().mockResolvedValue({
      output_text: JSON.stringify(mockResponse),
    });

    setClient(provider, {
      responses: { create: mockCreate },
    });

    const request: MealPlanRequest = {
      macroGoals: { protein: 150, carbohydrates: 200, fats: 65, fiber: 30 },
      dietaryRestrictions: ['vegetarian'],
      favoriteCuisines: ['Italian'],
      specificMeals: ['Salad'],
      excludePreviousWeekMeals: true,
      previousWeekMeals: ['Old Pasta'],
      additionalContext: 'I like it spicy',
    };

    const result = await provider.generateMealPlan(request);
    expect(result.generatedAt).toBeDefined();
    expect(result.weekPlan).toEqual([]);
    expect(result.shoppingList.items).toEqual([]);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-5.2',
        text: expect.objectContaining({
          format: expect.objectContaining({
            type: 'json_schema',
            name: 'meal_plan',
            strict: true,
          }),
        }),
      })
    );
  });

  describe('generateRecipe', () => {
    const recipeRequest: RecipeRequest = {
      mealName: 'Oatmeal',
      mealDescription: 'Hearty oats',
      ingredients: [{ name: 'Oats', quantity: '1', unit: 'cup' }],
      prepTime: '10 min',
      dietaryRestrictions: ['vegetarian'],
      favoriteCuisines: ['Italian'],
    };

    it('should throw when AI returns empty response', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        output_text: null,
      });
      setClient(provider, { responses: { create: mockCreate } });

      await expect(provider.generateRecipe(recipeRequest)).rejects.toThrow(
        'No response received from AI model'
      );
    });

    it('should parse valid recipe response and add generatedAt', async () => {
      const mockResponse = {
        mealName: 'Oatmeal',
        ingredients: [{ name: 'Oats', quantity: '1', unit: 'cup', notes: 'rolled' }],
        instructions: ['Boil water.', 'Add oats.'],
        tips: 'Add honey.',
      };
      const mockCreate = jest.fn().mockResolvedValue({
        output_text: JSON.stringify(mockResponse),
      });
      setClient(provider, { responses: { create: mockCreate } });

      const result = await provider.generateRecipe(recipeRequest);
      expect(result.generatedAt).toBeDefined();
      expect(result.mealName).toBe('Oatmeal');
      expect(result.ingredients).toHaveLength(1);
      expect(result.instructions).toHaveLength(2);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-5.2',
          text: expect.objectContaining({
            format: expect.objectContaining({
              type: 'json_schema',
              name: 'recipe',
              strict: true,
            }),
          }),
        })
      );
    });
  });
});
