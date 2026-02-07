import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, type Mock } from 'vitest';
import App from './App';

// Mock the API module
vi.mock('./services/api', () => ({
  generateMealPlan: vi.fn(),
}));

import { generateMealPlan } from './services/api';

const mockGenerateMealPlan = generateMealPlan as Mock;

describe('App', () => {
  beforeEach(() => {
    mockGenerateMealPlan.mockReset();
  });

  it('renders the app header', () => {
    render(<App />);
    expect(screen.getByText(/Weekly Menu Planner/i)).toBeInTheDocument();
  });

  it('renders the macro input fields', () => {
    render(<App />);
    expect(screen.getByLabelText(/Protein in grams/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Carbohydrates in grams/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fats in grams/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fiber in grams/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Calories/i)).toBeInTheDocument();
  });

  it('renders the generate button', () => {
    render(<App />);
    expect(screen.getByText(/Generate Meal Plan/i)).toBeInTheDocument();
  });

  it('shows loading state when generating', async () => {
    mockGenerateMealPlan.mockImplementation(
      () => new Promise(() => {}) // Never resolves, to keep loading state
    );

    render(<App />);
    const button = screen.getByText(/Generate Meal Plan/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Generating your personalized meal plan.../i)).toBeInTheDocument();
    });
  });

  it('shows error banner on API failure', async () => {
    mockGenerateMealPlan.mockRejectedValue(new Error('API failed'));

    render(<App />);
    const button = screen.getByText(/Generate Meal Plan/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('API failed');
    });
  });

  it('displays meal plan after successful generation', async () => {
    const mockPlan = {
      weekPlan: [
        {
          day: 'Monday',
          breakfast: { name: 'Oatmeal', description: 'Hearty oats', ingredients: [], macros: { protein: 10, carbohydrates: 40, fats: 5, fiber: 6 }, prepTime: '10 min' },
          morningSnack: { name: 'Apple', description: 'Fresh fruit', ingredients: [], macros: { protein: 1, carbohydrates: 25, fats: 0, fiber: 4 }, prepTime: '1 min' },
          lunch: { name: 'Chicken Salad', description: 'Grilled chicken', ingredients: [], macros: { protein: 40, carbohydrates: 15, fats: 10, fiber: 3 }, prepTime: '15 min' },
          afternoonSnack: { name: 'Yogurt', description: 'Greek yogurt', ingredients: [], macros: { protein: 15, carbohydrates: 10, fats: 5, fiber: 0 }, prepTime: '2 min' },
          dinner: { name: 'Salmon', description: 'Baked salmon', ingredients: [], macros: { protein: 45, carbohydrates: 20, fats: 15, fiber: 5 }, prepTime: '30 min' },
          dailyTotals: { protein: 111, carbohydrates: 110, fats: 35, fiber: 18, calories: 1200 },
        },
      ],
      shoppingList: {
        items: [
          { name: 'Chicken breast', totalQuantity: '2', unit: 'lbs', category: 'Meat & Seafood' },
          { name: 'Apples', totalQuantity: '7', unit: 'pieces', category: 'Produce' },
        ],
      },
      generatedAt: new Date().toISOString(),
    };

    mockGenerateMealPlan.mockResolvedValue(mockPlan);

    render(<App />);
    const button = screen.getByText(/Generate Meal Plan/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Monday')).toBeInTheDocument();
      expect(screen.getByText('Oatmeal')).toBeInTheDocument();
      expect(screen.getByText('Chicken Salad')).toBeInTheDocument();
      expect(screen.getByText('Chicken breast')).toBeInTheDocument();
    });
  });
});
