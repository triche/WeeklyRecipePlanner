import React from 'react';
import { MacroGoals, MealPlanRequest } from '../types';
import TagInput from './TagInput';
import DayOfWeekSelector from './DayOfWeekSelector';
import MealSlotSelector from './MealSlotSelector';

interface MealPlanFormProps {
  formData: MealPlanRequest;
  onChange: (data: MealPlanRequest) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const MealPlanForm: React.FC<MealPlanFormProps> = ({ formData, onChange, onSubmit, isLoading }) => {
  const updateMacros = (field: keyof MacroGoals, value: string): void => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(numValue)) return;
    onChange({
      ...formData,
      macroGoals: { ...formData.macroGoals, [field]: numValue },
    });
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card">
        <h2 className="card-title">🎯 Daily Macro Goals</h2>
        <div className="macro-inputs">
          <div className="macro-field protein">
            <label>Protein</label>
            <input
              type="number"
              min="0"
              value={formData.macroGoals.protein || ''}
              onChange={(e) => updateMacros('protein', e.target.value)}
              placeholder="0"
              aria-label="Protein in grams"
            />
            <span className="unit">grams</span>
          </div>
          <div className="macro-field carbs">
            <label>Carbohydrates</label>
            <input
              type="number"
              min="0"
              value={formData.macroGoals.carbohydrates || ''}
              onChange={(e) => updateMacros('carbohydrates', e.target.value)}
              placeholder="0"
              aria-label="Carbohydrates in grams"
            />
            <span className="unit">grams</span>
          </div>
          <div className="macro-field fats">
            <label>Fats</label>
            <input
              type="number"
              min="0"
              value={formData.macroGoals.fats || ''}
              onChange={(e) => updateMacros('fats', e.target.value)}
              placeholder="0"
              aria-label="Fats in grams"
            />
            <span className="unit">grams</span>
          </div>
          <div className="macro-field fiber">
            <label>Fiber</label>
            <input
              type="number"
              min="0"
              value={formData.macroGoals.fiber || ''}
              onChange={(e) => updateMacros('fiber', e.target.value)}
              placeholder="0"
              aria-label="Fiber in grams"
            />
            <span className="unit">grams</span>
          </div>
          <div className="macro-field calories">
            <label>Calories</label>
            <input
              type="number"
              min="0"
              value={formData.macroGoals.calories || ''}
              onChange={(e) => updateMacros('calories', e.target.value)}
              placeholder="0"
              aria-label="Calories"
            />
            <span className="unit">kcal</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">🍽️ Preferences</h2>
        <DayOfWeekSelector
          selectedDays={formData.selectedDays}
          onChange={(days) => onChange({ ...formData, selectedDays: days })}
        />
        <MealSlotSelector
          selectedMeals={formData.selectedMeals}
          onChange={(meals) => onChange({ ...formData, selectedMeals: meals })}
        />
        <div className="form-row">
          <TagInput
            label="Dietary Restrictions"
            tags={formData.dietaryRestrictions}
            onChange={(tags) => onChange({ ...formData, dietaryRestrictions: tags })}
            placeholder="e.g., vegetarian, gluten-free (press Enter)"
          />
          <TagInput
            label="Favorite Cuisines"
            tags={formData.favoriteCuisines}
            onChange={(tags) => onChange({ ...formData, favoriteCuisines: tags })}
            placeholder="e.g., Italian, Mexican (press Enter)"
          />
        </div>
        <TagInput
          label="Specific Meals to Include"
          tags={formData.specificMeals}
          onChange={(tags) => onChange({ ...formData, specificMeals: tags })}
          placeholder="e.g., Chicken stir-fry, Greek salad (press Enter)"
        />

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="excludePrevious"
            checked={formData.excludePreviousWeekMeals}
            onChange={(e) => onChange({ ...formData, excludePreviousWeekMeals: e.target.checked })}
          />
          <label htmlFor="excludePrevious">Don&apos;t repeat meals from previous week</label>
        </div>

        {formData.excludePreviousWeekMeals && (
          <TagInput
            label="Previous Week's Meals to Exclude"
            tags={formData.previousWeekMeals}
            onChange={(tags) => onChange({ ...formData, previousWeekMeals: tags })}
            placeholder="Enter meals from last week (press Enter)"
          />
        )}

        <div className="form-group">
          <label htmlFor="additionalContext">Additional Context for AI</label>
          <textarea
            id="additionalContext"
            value={formData.additionalContext}
            onChange={(e) => onChange({ ...formData, additionalContext: e.target.value })}
            placeholder="Any other preferences, constraints, or context you'd like the AI to consider..."
          />
        </div>
      </div>

      <div className="generate-btn-wrapper">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? '⏳ Generating...' : '✨ Generate Meal Plan'}
        </button>
      </div>
    </form>
  );
};

export default MealPlanForm;
