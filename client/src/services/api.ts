import { MealPlanRequest, MealPlanResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function generateMealPlan(request: MealPlanRequest): Promise<MealPlanResponse> {
  const response = await fetch(`${API_BASE}/meal-plan/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}
