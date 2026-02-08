import React, { useState, useEffect } from 'react';
import './App.css';
import { MealPlanForm, MealPlanDisplay, ShoppingListDisplay, DevConsole } from './components';
import { generateMealPlan } from './services/api';
import { MealPlanRequest, MealPlanResponse, ALL_DAYS, ALL_MEAL_SLOTS } from './types';
import devLogger from './services/devLogger';

const defaultFormData: MealPlanRequest = {
  macroGoals: {
    protein: 150,
    carbohydrates: 200,
    fats: 65,
    fiber: 30,
    calories: 2000,
  },
  selectedDays: [...ALL_DAYS],
  selectedMeals: [...ALL_MEAL_SLOTS],
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
  const [devMode, setDevMode] = useState(false);

  // Install the dev logger once on mount
  useEffect(() => {
    devLogger.install();
    return () => devLogger.uninstall();
  }, []);

  // Toggle dev mode with Ctrl+Shift+D (or Cmd+Shift+D on Mac)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setDevMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    <div className={`app ${devMode ? 'dev-mode-active' : ''}`}>
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
          <MealPlanDisplay weekPlan={mealPlan.weekPlan} formData={formData} />
          <ShoppingListDisplay shoppingList={mealPlan.shoppingList} />
        </>
      )}

      {/* Dev mode toggle button (always visible, small) */}
      <button
        className="dev-mode-toggle"
        onClick={() => setDevMode((prev) => !prev)}
        title="Toggle Dev Console (Ctrl+Shift+D)"
        aria-label="Toggle Dev Console"
      >
        {devMode ? '🛠 Dev' : '🛠'}
      </button>

      <DevConsole visible={devMode} onClose={() => setDevMode(false)} />
    </div>
  );
};

export default App;
