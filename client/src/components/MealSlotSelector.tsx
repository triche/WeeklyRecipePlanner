import React from 'react';
import { MealSlot, ALL_MEAL_SLOTS, MEAL_SLOT_LABELS } from '../types';

interface MealSlotSelectorProps {
  selectedMeals: MealSlot[];
  onChange: (meals: MealSlot[]) => void;
}

const MealSlotSelector: React.FC<MealSlotSelectorProps> = ({ selectedMeals, onChange }) => {
  const toggle = (slot: MealSlot): void => {
    if (selectedMeals.includes(slot)) {
      // Don't allow deselecting the last meal
      if (selectedMeals.length === 1) return;
      onChange(selectedMeals.filter((s) => s !== slot));
    } else {
      // Maintain canonical order
      onChange(ALL_MEAL_SLOTS.filter((s) => selectedMeals.includes(s) || s === slot));
    }
  };

  return (
    <div className="form-group">
      <label>Meals to Include</label>
      <div className="day-selector" role="group" aria-label="Meals to include">
        {ALL_MEAL_SLOTS.map((slot) => {
          const active = selectedMeals.includes(slot);
          return (
            <button
              key={slot}
              type="button"
              role="checkbox"
              aria-checked={active}
              aria-label={MEAL_SLOT_LABELS[slot]}
              className={`day-chip ${active ? 'day-chip-active' : ''}`}
              onClick={() => toggle(slot)}
            >
              {MEAL_SLOT_LABELS[slot]}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MealSlotSelector;
