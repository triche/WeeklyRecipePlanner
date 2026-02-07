import OpenAI from 'openai';
import { MealPlanRequest, MealPlanResponse, RecipeRequest, RecipeResponse } from '../types';

export interface AIProvider {
  generateMealPlan(request: MealPlanRequest): Promise<MealPlanResponse>;
  generateRecipe(request: RecipeRequest): Promise<RecipeResponse>;
}

/**
 * JSON Schema for the meal plan response, used with the Responses API
 * structured output (`text.format` with `json_schema`).
 */
const mealPlanJsonSchema = {
  name: 'meal_plan',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      weekPlan: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            day: { type: 'string' },
            breakfast: { $ref: '#/$defs/meal' },
            morningSnack: { $ref: '#/$defs/meal' },
            lunch: { $ref: '#/$defs/meal' },
            afternoonSnack: { $ref: '#/$defs/meal' },
            dinner: { $ref: '#/$defs/meal' },
            dailyTotals: { $ref: '#/$defs/macros' },
          },
          required: ['day', 'breakfast', 'morningSnack', 'lunch', 'afternoonSnack', 'dinner', 'dailyTotals'],
          additionalProperties: false,
        },
      },
      shoppingList: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                totalQuantity: { type: 'string' },
                unit: { type: 'string' },
                category: {
                  type: 'string',
                  enum: ['Produce', 'Dairy', 'Meat & Seafood', 'Bakery', 'Frozen', 'Pantry', 'Beverages', 'Spices & Seasonings', 'Other'],
                },
              },
              required: ['name', 'totalQuantity', 'unit', 'category'],
              additionalProperties: false,
            },
          },
        },
        required: ['items'],
        additionalProperties: false,
      },
    },
    required: ['weekPlan', 'shoppingList'],
    additionalProperties: false,
    $defs: {
      macros: {
        type: 'object',
        properties: {
          calories: { type: 'number' },
          protein: { type: 'number' },
          carbohydrates: { type: 'number' },
          fats: { type: 'number' },
          fiber: { type: 'number' },
        },
        required: ['calories', 'protein', 'carbohydrates', 'fats', 'fiber'],
        additionalProperties: false,
      },
      ingredient: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantity: { type: 'string' },
          unit: { type: 'string' },
          category: { type: 'string' },
        },
        required: ['name', 'quantity', 'unit', 'category'],
        additionalProperties: false,
      },
      meal: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          ingredients: { type: 'array', items: { $ref: '#/$defs/ingredient' } },
          macros: { $ref: '#/$defs/macros' },
          prepTime: { type: 'string' },
        },
        required: ['name', 'description', 'ingredients', 'macros', 'prepTime'],
        additionalProperties: false,
      },
    },
  },
} as const;

/**
 * JSON Schema for the recipe response, used with the Responses API
 * structured output (`text.format` with `json_schema`).
 */
const recipeJsonSchema = {
  name: 'recipe',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      mealName: { type: 'string' },
      ingredients: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            quantity: { type: 'string' },
            unit: { type: 'string' },
            notes: { type: 'string' },
          },
          required: ['name', 'quantity', 'unit', 'notes'],
          additionalProperties: false,
        },
      },
      instructions: {
        type: 'array',
        items: { type: 'string' },
      },
      tips: { type: 'string' },
    },
    required: ['mealName', 'ingredients', 'instructions', 'tips'],
    additionalProperties: false,
  },
} as const;

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generateMealPlan(request: MealPlanRequest): Promise<MealPlanResponse> {
    const instructions = this.buildInstructions();
    const input = this.buildInput(request);

    const response = await this.client.responses.create({
      model: this.model,
      instructions,
      input,
      temperature: 0.7,
      text: {
        format: {
          type: 'json_schema',
          ...mealPlanJsonSchema,
        },
      },
      store: false,
    });

    const content = response.output_text;
    if (!content) {
      throw new Error('No response received from AI model');
    }

    const parsed = JSON.parse(content) as MealPlanResponse;
    parsed.generatedAt = new Date().toISOString();
    return parsed;
  }

  async generateRecipe(request: RecipeRequest): Promise<RecipeResponse> {
    const instructions = this.buildRecipeInstructions();
    const input = this.buildRecipeInput(request);

    const response = await this.client.responses.create({
      model: this.model,
      instructions,
      input,
      temperature: 0.7,
      text: {
        format: {
          type: 'json_schema',
          ...recipeJsonSchema,
        },
      },
      store: false,
    });

    const content = response.output_text;
    if (!content) {
      throw new Error('No response received from AI model');
    }

    const parsed = JSON.parse(content) as RecipeResponse;
    parsed.generatedAt = new Date().toISOString();
    return parsed;
  }

  private buildRecipeInstructions(): string {
    return `You are a professional chef and recipe writer. Generate a detailed recipe with exact ingredients and step-by-step instructions.

IMPORTANT RULES:
- Provide precise ingredient quantities and preparation notes
- Write clear, numbered step-by-step cooking instructions
- Each instruction step should be a single, clear action
- Include any helpful tips for the recipe
- Use the provided ingredients as the base but add common pantry items (salt, pepper, oil, etc.) as needed
- Keep instructions practical and achievable for a home cook`;
  }

  private buildRecipeInput(request: RecipeRequest): string {
    const parts: string[] = [];

    parts.push(`Recipe: ${request.mealName}`);

    if (request.mealDescription) {
      parts.push(`Description: ${request.mealDescription}`);
    }

    if (request.prepTime) {
      parts.push(`Target Prep Time: ${request.prepTime}`);
    }

    if (request.ingredients.length > 0) {
      parts.push(`\nPlanned Ingredients:`);
      for (const ing of request.ingredients) {
        parts.push(`- ${ing.quantity} ${ing.unit} ${ing.name}`);
      }
    }

    if (request.dietaryRestrictions.length > 0) {
      parts.push(`\nDietary Restrictions: ${request.dietaryRestrictions.join(', ')}`);
    }

    if (request.favoriteCuisines.length > 0) {
      parts.push(`\nCuisine Style: ${request.favoriteCuisines.join(', ')}`);
    }

    if (request.macros) {
      parts.push(`\nTarget Macros:`);
      parts.push(`- Protein: ${request.macros.protein}g`);
      parts.push(`- Carbohydrates: ${request.macros.carbohydrates}g`);
      parts.push(`- Fats: ${request.macros.fats}g`);
      if (request.macros.calories) {
        parts.push(`- Calories: ${request.macros.calories}`);
      }
    }

    return parts.join('\n');
  }

  private buildInstructions(): string {
    return `You are a professional nutritionist and meal planner. Generate a complete 7-day meal plan with exact macros and a consolidated shopping list.

IMPORTANT RULES:
- Every day MUST include: breakfast, morningSnack, lunch, afternoonSnack, dinner
- Daily macros should be as close as possible to the user's targets
- The shopping list MUST aggregate identical ingredients across all meals
- Categorize shopping list items into: Produce, Dairy, Meat & Seafood, Bakery, Frozen, Pantry, Beverages, Spices & Seasonings, Other`;
  }

  private buildInput(request: MealPlanRequest): string {
    const parts: string[] = [];

    parts.push(`Daily Macro Goals:`);
    parts.push(`- Protein: ${request.macroGoals.protein}g`);
    parts.push(`- Carbohydrates: ${request.macroGoals.carbohydrates}g`);
    parts.push(`- Fats: ${request.macroGoals.fats}g`);
    parts.push(`- Fiber: ${request.macroGoals.fiber}g`);
    if (request.macroGoals.calories) {
      parts.push(`- Calories: ${request.macroGoals.calories}`);
    }

    if (request.dietaryRestrictions.length > 0) {
      parts.push(`\nDietary Restrictions: ${request.dietaryRestrictions.join(', ')}`);
    }

    if (request.favoriteCuisines.length > 0) {
      parts.push(`\nPreferred Cuisines: ${request.favoriteCuisines.join(', ')}`);
    }

    if (request.specificMeals.length > 0) {
      parts.push(`\nSpecific Meals to Include: ${request.specificMeals.join(', ')}`);
    }

    if (request.excludePreviousWeekMeals && request.previousWeekMeals.length > 0) {
      parts.push(`\nDo NOT include these meals from last week: ${request.previousWeekMeals.join(', ')}`);
    }

    if (request.additionalContext) {
      parts.push(`\nAdditional Context: ${request.additionalContext}`);
    }

    return parts.join('\n');
  }
}
