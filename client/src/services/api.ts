import { MealPlanRequest, MealPlanResponse, RecipeRequest, RecipeResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function generateMealPlan(request: MealPlanRequest): Promise<MealPlanResponse> {
  console.info(`[API] POST ${API_BASE}/meal-plan/generate`);
  console.log('[API] Request payload:', request);

  const response = await fetch(`${API_BASE}/meal-plan/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    const errMsg = error.error || `Request failed with status ${response.status}`;
    console.error(`[API] Error ${response.status}:`, errMsg, error.details ?? '');
    throw new Error(errMsg);
  }

  const data: MealPlanResponse = await response.json();
  console.info(`[API] Meal plan generated successfully (${data.weekPlan.length} days)`);
  return data;
}

export async function healthCheck(): Promise<{ status: string }> {
  console.info(`[API] GET ${API_BASE}/health`);
  const response = await fetch(`${API_BASE}/health`);
  const data = await response.json();
  console.log('[API] Health check result:', data);
  return data;
}

export async function fetchRecipe(request: RecipeRequest): Promise<RecipeResponse> {
  console.info(`[API] POST ${API_BASE}/meal-plan/recipe`);
  console.log('[API] Recipe request payload:', request);

  const response = await fetch(`${API_BASE}/meal-plan/recipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    const errMsg = error.error || `Request failed with status ${response.status}`;
    console.error(`[API] Error ${response.status}:`, errMsg, error.details ?? '');
    throw new Error(errMsg);
  }

  const data: RecipeResponse = await response.json();
  console.info(`[API] Recipe generated successfully for "${data.mealName}"`);
  return data;
}
