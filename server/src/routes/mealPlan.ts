import { Router, Request, Response } from 'express';
import { AIProvider } from '../services/aiProvider';
import { MealPlanRequestSchema, RecipeRequestSchema } from '../types';
import { ZodError } from 'zod';

export function createMealPlanRouter(aiProvider: AIProvider): Router {
  const router = Router();

  router.post('/generate', async (req: Request, res: Response) => {
    try {
      const validatedRequest = MealPlanRequestSchema.parse(req.body);
      const mealPlan = await aiProvider.generateMealPlan(validatedRequest);
      res.json(mealPlan);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }

      console.error('Error generating meal plan:', error);
      res.status(500).json({
        error: 'Failed to generate meal plan. Please try again.',
      });
    }
  });

  router.post('/recipe', async (req: Request, res: Response) => {
    try {
      const validatedRequest = RecipeRequestSchema.parse(req.body);
      const recipe = await aiProvider.generateRecipe(validatedRequest);
      res.json(recipe);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation error',
          details: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }

      console.error('Error generating recipe:', error);
      res.status(500).json({
        error: 'Failed to generate recipe. Please try again.',
      });
    }
  });

  router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return router;
}
