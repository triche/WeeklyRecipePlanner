import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, type Mock } from 'vitest';
import MealPlanDisplay from './MealPlanDisplay';
import { MealPlanRequest, ALL_DAYS, ALL_MEAL_SLOTS } from '../types';
import * as api from '../services/api';

// Mock the API module
vi.mock('../services/api', () => ({
  fetchRecipe: vi.fn(),
}));
const mockFetchRecipe = api.fetchRecipe as Mock;

const mockFormData: MealPlanRequest = {
  macroGoals: { protein: 150, carbohydrates: 200, fats: 65, fiber: 30 },
  selectedDays: [...ALL_DAYS],
  selectedMeals: [...ALL_MEAL_SLOTS],
  dietaryRestrictions: ['vegetarian'],
  favoriteCuisines: ['Italian'],
  specificMeals: [],
  additionalContext: '',
};

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders meal plan section title', () => {
    render(<MealPlanDisplay weekPlan={mockWeekPlan} formData={mockFormData} />);
    expect(screen.getByText(/Your Weekly Meal Plan/)).toBeInTheDocument();
  });

  it('renders day header', () => {
    render(<MealPlanDisplay weekPlan={mockWeekPlan} formData={mockFormData} />);
    expect(screen.getByText('Monday')).toBeInTheDocument();
  });

  it('renders all meal slots', () => {
    render(<MealPlanDisplay weekPlan={mockWeekPlan} formData={mockFormData} />);
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Morning Snack')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('Afternoon Snack')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();
  });

  it('displays meal names as clickable buttons', () => {
    render(<MealPlanDisplay weekPlan={mockWeekPlan} formData={mockFormData} />);
    const oatmealBtn = screen.getByText('Oatmeal');
    expect(oatmealBtn.tagName).toBe('BUTTON');
    expect(oatmealBtn).toHaveClass('meal-name-link');
  });

  it('shows macro tags for meals', () => {
    render(<MealPlanDisplay weekPlan={mockWeekPlan} formData={mockFormData} />);
    expect(screen.getAllByText(/P: 10g/).length).toBeGreaterThan(0);
  });

  it('shows daily totals in header', () => {
    render(<MealPlanDisplay weekPlan={mockWeekPlan} formData={mockFormData} />);
    expect(screen.getByText(/P: 111g/)).toBeInTheDocument();
  });

  it('opens recipe modal with loading state when meal is clicked', async () => {
    mockFetchRecipe.mockReturnValue(new Promise(() => {})); // never resolves

    render(<MealPlanDisplay weekPlan={mockWeekPlan} formData={mockFormData} />);
    fireEvent.click(screen.getByText('Oatmeal'));

    expect(screen.getByText('Loading Recipe...')).toBeInTheDocument();
    expect(screen.getByText('Generating recipe with AI...')).toBeInTheDocument();
  });

  it('displays recipe content after successful fetch', async () => {
    const mockRecipe = {
      mealName: 'Oatmeal',
      ingredients: [{ name: 'Oats', quantity: '1', unit: 'cup', notes: 'rolled' }],
      instructions: ['Boil water.', 'Add oats and cook for 5 minutes.'],
      tips: 'Add honey for sweetness.',
      generatedAt: new Date().toISOString(),
    };
    mockFetchRecipe.mockResolvedValue(mockRecipe);

    render(<MealPlanDisplay weekPlan={mockWeekPlan} formData={mockFormData} />);
    fireEvent.click(screen.getByText('Oatmeal'));

    await waitFor(() => {
      expect(screen.getByText('Oats')).toBeInTheDocument();
    });
    expect(screen.getByText('Boil water.')).toBeInTheDocument();
    expect(screen.getByText('Add oats and cook for 5 minutes.')).toBeInTheDocument();
    expect(screen.getByText('Add honey for sweetness.')).toBeInTheDocument();
  });

  it('uses cached recipe on second click', async () => {
    const mockRecipe = {
      mealName: 'Oatmeal',
      ingredients: [{ name: 'Oats', quantity: '1', unit: 'cup', notes: '' }],
      instructions: ['Cook oats.'],
      tips: '',
      generatedAt: new Date().toISOString(),
    };
    mockFetchRecipe.mockResolvedValue(mockRecipe);

    render(<MealPlanDisplay weekPlan={mockWeekPlan} formData={mockFormData} />);

    // First click
    fireEvent.click(screen.getByText('Oatmeal'));
    await waitFor(() => expect(screen.getByText('Cook oats.')).toBeInTheDocument());

    // Close modal
    fireEvent.click(screen.getByLabelText('Close recipe modal'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Second click - should not call API again
    fireEvent.click(screen.getByText('Oatmeal'));
    await waitFor(() => expect(screen.getByText('Cook oats.')).toBeInTheDocument());
    expect(mockFetchRecipe).toHaveBeenCalledTimes(1);
  });

  it('shows error when recipe fetch fails', async () => {
    mockFetchRecipe.mockRejectedValue(new Error('AI service unavailable'));

    render(<MealPlanDisplay weekPlan={mockWeekPlan} formData={mockFormData} />);
    fireEvent.click(screen.getByText('Oatmeal'));

    await waitFor(() => {
      expect(screen.getByText(/AI service unavailable/)).toBeInTheDocument();
    });
  });
});
