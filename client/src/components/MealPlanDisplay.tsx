import React, { useState, useCallback, useRef } from 'react';
import { DayPlan, Meal, MealPlanRequest, RecipeRequest, RecipeResponse } from '../types';
import { fetchRecipe } from '../services/api';
import RecipeModal from './RecipeModal';

interface MealPlanDisplayProps {
  weekPlan: DayPlan[];
  formData: MealPlanRequest;
}

const MealSlot: React.FC<{ label: string; meal: Meal; onMealClick: (meal: Meal) => void }> = ({
  label,
  meal,
  onMealClick,
}) => (
  <div className="meal-slot">
    <div className="meal-label">{label}</div>
    <button
      className="meal-name meal-name-link"
      onClick={() => onMealClick(meal)}
      title="Click to view recipe"
    >
      {meal.name}
    </button>
    <div className="meal-description">{meal.description}</div>
    <div className="meal-macros">
      <span className="macro-tag protein">P: {meal.macros.protein}g</span>
      <span className="macro-tag carbs">C: {meal.macros.carbohydrates}g</span>
      <span className="macro-tag fats">F: {meal.macros.fats}g</span>
      <span className="macro-tag fiber">Fb: {meal.macros.fiber}g</span>
    </div>
    {meal.prepTime && <div className="meal-prep-time">⏱️ {meal.prepTime}</div>}
  </div>
);

const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ weekPlan, formData }) => {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);

  // Cache: keyed by meal name
  const recipeCacheRef = useRef<Map<string, RecipeResponse>>(new Map());

  const handleMealClick = useCallback(
    async (meal: Meal) => {
      setSelectedMeal(meal);
      setRecipeError(null);

      // Check cache first
      const cached = recipeCacheRef.current.get(meal.name);
      if (cached) {
        setRecipe(cached);
        setIsLoadingRecipe(false);
        return;
      }

      // Fetch from AI
      setRecipe(null);
      setIsLoadingRecipe(true);

      const request: RecipeRequest = {
        mealName: meal.name,
        mealDescription: meal.description,
        ingredients: meal.ingredients.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
        })),
        prepTime: meal.prepTime,
        dietaryRestrictions: formData.dietaryRestrictions,
        favoriteCuisines: formData.favoriteCuisines,
        macros: meal.macros,
      };

      try {
        const result = await fetchRecipe(request);
        recipeCacheRef.current.set(meal.name, result);
        setRecipe(result);
      } catch (err) {
        setRecipeError(err instanceof Error ? err.message : 'Failed to load recipe.');
      } finally {
        setIsLoadingRecipe(false);
      }
    },
    [formData]
  );

  const handleCloseModal = useCallback(() => {
    setSelectedMeal(null);
    setRecipe(null);
    setRecipeError(null);
    setIsLoadingRecipe(false);
  }, []);

  return (
    <div className="meal-plan-section">
      <h2 className="section-title">📅 Your Weekly Meal Plan</h2>
      {weekPlan.map((day) => (
        <div key={day.day} className="day-card">
          <div className="day-header">
            <h3>{day.day}</h3>
            <div className="day-macros">
              <span>🔴 P: {day.dailyTotals.protein}g</span>
              <span>🔵 C: {day.dailyTotals.carbohydrates}g</span>
              <span>🟡 F: {day.dailyTotals.fats}g</span>
              <span>🟢 Fb: {day.dailyTotals.fiber}g</span>
              {day.dailyTotals.calories && <span>🟣 {day.dailyTotals.calories} kcal</span>}
            </div>
          </div>
          <div className="day-meals">
            <MealSlot label="Breakfast" meal={day.breakfast} onMealClick={handleMealClick} />
            <MealSlot label="Morning Snack" meal={day.morningSnack} onMealClick={handleMealClick} />
            <MealSlot label="Lunch" meal={day.lunch} onMealClick={handleMealClick} />
            <MealSlot label="Afternoon Snack" meal={day.afternoonSnack} onMealClick={handleMealClick} />
            <MealSlot label="Dinner" meal={day.dinner} onMealClick={handleMealClick} />
          </div>
        </div>
      ))}

      {selectedMeal && (
        <RecipeModal
          recipe={recipe}
          isLoading={isLoadingRecipe}
          error={recipeError}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default MealPlanDisplay;
