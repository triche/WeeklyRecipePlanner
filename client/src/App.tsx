import React, { useState } from 'react';
import './App.css';
import { MealPlanForm, MealPlanDisplay, ShoppingListDisplay } from './components';
import { generateMealPlan } from './services/api';
import { MealPlanRequest, MealPlanResponse } from './types';

const defaultFormData: MealPlanRequest = {
  macroGoals: {
    protein: 150,
    carbohydrates: 200,
    fats: 65,
    fiber: 30,
    calories: 2000,
  },
  dietaryRestrictions: [],
  favoriteCuisines: [],
  specificMeals: [],
  excludePreviousWeekMeals: false,
  previousWeekMeals: [],
  additionalContext: '',
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<MealPlanRequest>(defaultFormData);
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateMealPlan(formData);
      setMealPlan(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍽️ Weekly Menu Planner</h1>
        <p>AI-powered meal planning with macro tracking</p>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          ⚠️ {error}
        </div>
      )}

      <MealPlanForm
        formData={formData}
        onChange={setFormData}
        onSubmit={handleGenerate}
        isLoading={isLoading}
      />

      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Generating your personalized meal plan...</p>
        </div>
      )}

      {mealPlan && !isLoading && (
        <>
          <MealPlanDisplay weekPlan={mealPlan.weekPlan} />
          <ShoppingListDisplay shoppingList={mealPlan.shoppingList} />
        </>
      )}
    </div>
  );
};

export default App;
