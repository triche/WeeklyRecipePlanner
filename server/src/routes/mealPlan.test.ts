import express from 'express';
import request from 'supertest';
import { createApp } from '../app';
import { AIProvider } from '../services';
import { MealPlanResponse, MealPlanRequest } from '../types';

// Minimal mock AI provider for integration tests
class MockAIProvider implements AIProvider {
  generateMealPlan = jest.fn<Promise<MealPlanResponse>, [MealPlanRequest]>();
}

describe('API Routes', () => {
  let app: express.Application;
  let mockProvider: MockAIProvider;

  beforeEach(() => {
    mockProvider = new MockAIProvider();
    app = createApp(mockProvider);
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api/meal-plan/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/meal-plan/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('POST /api/meal-plan/generate', () => {
    const validRequest = {
      macroGoals: {
        protein: 150,
        carbohydrates: 200,
        fats: 65,
        fiber: 30,
        calories: 2000,
      },
    };

    it('should return 400 for invalid request body', async () => {
      const res = await request(app)
        .post('/api/meal-plan/generate')
        .send({ macroGoals: { protein: -1, carbohydrates: 200, fats: 65, fiber: 30 } });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation error');
    });

    it('should return 400 for missing macroGoals', async () => {
      const res = await request(app)
        .post('/api/meal-plan/generate')
        .send({});
      expect(res.status).toBe(400);
    });

    it('should return meal plan on success', async () => {
      const mockPlan: MealPlanResponse = {
        weekPlan: [],
        shoppingList: { items: [] },
        generatedAt: new Date().toISOString(),
      };
      mockProvider.generateMealPlan.mockResolvedValue(mockPlan);

      const res = await request(app)
        .post('/api/meal-plan/generate')
        .send(validRequest);
      expect(res.status).toBe(200);
      expect(res.body.weekPlan).toBeDefined();
      expect(res.body.shoppingList).toBeDefined();
    });

    it('should return 500 when AI provider fails', async () => {
      mockProvider.generateMealPlan.mockRejectedValue(new Error('AI error'));

      const res = await request(app)
        .post('/api/meal-plan/generate')
        .send(validRequest);
      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Failed to generate');
    });
  });
});
