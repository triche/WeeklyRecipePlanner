import React from 'react';
import { DayOfWeek, ALL_DAYS } from '../types';

interface DayOfWeekSelectorProps {
  selectedDays: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
}

const SHORT_LABELS: Record<DayOfWeek, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

const DayOfWeekSelector: React.FC<DayOfWeekSelectorProps> = ({ selectedDays, onChange }) => {
  const toggle = (day: DayOfWeek): void => {
    if (selectedDays.includes(day)) {
      // Don't allow deselecting the last day
      if (selectedDays.length === 1) return;
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      // Maintain canonical order
      onChange(ALL_DAYS.filter((d) => selectedDays.includes(d) || d === day));
    }
  };

  return (
    <div className="form-group">
      <label>Days to Plan</label>
      <div className="day-selector" role="group" aria-label="Days of the week">
        {ALL_DAYS.map((day) => {
          const active = selectedDays.includes(day);
          return (
            <button
              key={day}
              type="button"
              role="checkbox"
              aria-checked={active}
              aria-label={day}
              className={`day-chip ${active ? 'day-chip-active' : ''}`}
              onClick={() => toggle(day)}
            >
              {SHORT_LABELS[day]}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DayOfWeekSelector;
