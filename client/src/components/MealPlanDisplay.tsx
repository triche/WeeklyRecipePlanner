import React from 'react';
import { DayPlan, Meal } from '../types';

interface MealPlanDisplayProps {
  weekPlan: DayPlan[];
}

const MealSlot: React.FC<{ label: string; meal: Meal }> = ({ label, meal }) => (
  <div className="meal-slot">
    <div className="meal-label">{label}</div>
    <div className="meal-name">{meal.name}</div>
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

const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ weekPlan }) => {
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
            <MealSlot label="Breakfast" meal={day.breakfast} />
            <MealSlot label="Morning Snack" meal={day.morningSnack} />
            <MealSlot label="Lunch" meal={day.lunch} />
            <MealSlot label="Afternoon Snack" meal={day.afternoonSnack} />
            <MealSlot label="Dinner" meal={day.dinner} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MealPlanDisplay;
