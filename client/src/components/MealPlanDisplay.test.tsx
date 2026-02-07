import React from 'react';
import { render, screen } from '@testing-library/react';
import MealPlanDisplay from './MealPlanDisplay';

const mockWeekPlan = [
  {
    day: 'Monday',
    breakfast: { name: 'Oatmeal', description: 'Hearty oats', ingredients: [], macros: { protein: 10, carbohydrates: 40, fats: 5, fiber: 6 }, prepTime: '10 min' },
    morningSnack: { name: 'Apple', description: 'Fresh fruit', ingredients: [], macros: { protein: 1, carbohydrates: 25, fats: 0, fiber: 4 }, prepTime: '1 min' },
    lunch: { name: 'Chicken Salad', description: 'Grilled chicken', ingredients: [], macros: { protein: 40, carbohydrates: 15, fats: 10, fiber: 3 }, prepTime: '15 min' },
    afternoonSnack: { name: 'Yogurt', description: 'Greek yogurt', ingredients: [], macros: { protein: 15, carbohydrates: 10, fats: 5, fiber: 0 }, prepTime: '2 min' },
    dinner: { name: 'Salmon', description: 'Baked salmon', ingredients: [], macros: { protein: 45, carbohydrates: 20, fats: 15, fiber: 5 }, prepTime: '30 min' },
    dailyTotals: { protein: 111, carbohydrates: 110, fats: 35, fiber: 18, calories: 1200 },
  },
];

describe('MealPlanDisplay', () => {
  it('renders meal plan section title', () => {
    render(<MealPlanDisplay weekPlan={mockWeekPlan} />);
    expect(screen.getByText(/Your Weekly Meal Plan/)).toBeInTheDocument();
  });

  it('renders day header', () => {
    render(<MealPlanDisplay weekPlan={mockWeekPlan} />);
    expect(screen.getByText('Monday')).toBeInTheDocument();
  });

  it('renders all meal slots', () => {
    render(<MealPlanDisplay weekPlan={mockWeekPlan} />);
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Morning Snack')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('Afternoon Snack')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();
  });

  it('displays meal names', () => {
    render(<MealPlanDisplay weekPlan={mockWeekPlan} />);
    expect(screen.getByText('Oatmeal')).toBeInTheDocument();
    expect(screen.getByText('Chicken Salad')).toBeInTheDocument();
    expect(screen.getByText('Salmon')).toBeInTheDocument();
  });

  it('shows macro tags for meals', () => {
    render(<MealPlanDisplay weekPlan={mockWeekPlan} />);
    // Check for protein macro on oatmeal
    expect(screen.getAllByText(/P: 10g/).length).toBeGreaterThan(0);
  });

  it('shows daily totals in header', () => {
    render(<MealPlanDisplay weekPlan={mockWeekPlan} />);
    expect(screen.getByText(/P: 111g/)).toBeInTheDocument();
  });
});
