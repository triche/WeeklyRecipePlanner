import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MealSlotSelector from './MealSlotSelector';
import { ALL_MEAL_SLOTS, MealSlot } from '../types';

describe('MealSlotSelector', () => {
  it('renders all five meal slots', () => {
    render(<MealSlotSelector selectedMeals={[...ALL_MEAL_SLOTS]} onChange={vi.fn()} />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(5);
    expect(screen.getByLabelText('Breakfast')).toBeInTheDocument();
    expect(screen.getByLabelText('Dinner')).toBeInTheDocument();
  });

  it('shows all slots as active when all selected', () => {
    render(<MealSlotSelector selectedMeals={[...ALL_MEAL_SLOTS]} onChange={vi.fn()} />);
    const chips = screen.getAllByRole('checkbox');
    chips.forEach((chip) => {
      expect(chip).toHaveAttribute('aria-checked', 'true');
    });
  });

  it('shows deselected slots as inactive', () => {
    const meals: MealSlot[] = ['breakfast', 'lunch', 'dinner'];
    render(<MealSlotSelector selectedMeals={meals} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Breakfast')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText('Morning Snack')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByLabelText('Lunch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText('Afternoon Snack')).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange without the slot when toggling off', () => {
    const onChange = vi.fn();
    render(<MealSlotSelector selectedMeals={[...ALL_MEAL_SLOTS]} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Morning Snack'));
    expect(onChange).toHaveBeenCalledWith(
      ALL_MEAL_SLOTS.filter((s) => s !== 'morningSnack')
    );
  });

  it('calls onChange with the slot added in canonical order when toggling on', () => {
    const onChange = vi.fn();
    const meals: MealSlot[] = ['breakfast', 'dinner'];
    render(<MealSlotSelector selectedMeals={meals} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Lunch'));
    expect(onChange).toHaveBeenCalledWith(['breakfast', 'lunch', 'dinner']);
  });

  it('does not allow deselecting the last remaining slot', () => {
    const onChange = vi.fn();
    render(<MealSlotSelector selectedMeals={['lunch']} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Lunch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders display labels', () => {
    render(<MealSlotSelector selectedMeals={[...ALL_MEAL_SLOTS]} onChange={vi.fn()} />);
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Morning Snack')).toBeInTheDocument();
    expect(screen.getByText('Afternoon Snack')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();
  });
});
