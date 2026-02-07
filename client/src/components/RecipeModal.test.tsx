import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import RecipeModal from './RecipeModal';
import { RecipeResponse } from '../types';

const mockRecipe: RecipeResponse = {
  mealName: 'Classic Oatmeal',
  ingredients: [
    { name: 'Rolled Oats', quantity: '1', unit: 'cup', notes: 'old-fashioned' },
    { name: 'Water', quantity: '2', unit: 'cups', notes: '' },
    { name: 'Honey', quantity: '1', unit: 'tbsp', notes: 'optional' },
  ],
  instructions: [
    'Bring water to a boil.',
    'Add oats and reduce heat.',
    'Cook for 5 minutes, stirring occasionally.',
  ],
  tips: 'Top with fresh berries for extra nutrients.',
  generatedAt: new Date().toISOString(),
};

describe('RecipeModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders recipe content when recipe is provided', () => {
    render(<RecipeModal recipe={mockRecipe} isLoading={false} error={null} onClose={onClose} />);

    expect(screen.getByText('Classic Oatmeal')).toBeInTheDocument();
    expect(screen.getByText('Rolled Oats')).toBeInTheDocument();
    expect(screen.getByText('Bring water to a boil.')).toBeInTheDocument();
    expect(screen.getByText('Top with fresh berries for extra nutrients.')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<RecipeModal recipe={null} isLoading={true} error={null} onClose={onClose} />);

    expect(screen.getByText('Loading Recipe...')).toBeInTheDocument();
    expect(screen.getByText('Generating recipe with AI...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(
      <RecipeModal recipe={null} isLoading={false} error="Something went wrong" onClose={onClose} />
    );

    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<RecipeModal recipe={mockRecipe} isLoading={false} error={null} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Close recipe modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    render(<RecipeModal recipe={mockRecipe} isLoading={false} error={null} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the overlay background', () => {
    render(<RecipeModal recipe={mockRecipe} isLoading={false} error={null} onClose={onClose} />);

    // The overlay div has role="dialog" and the click handler checks e.target === e.currentTarget
    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the modal', () => {
    render(<RecipeModal recipe={mockRecipe} isLoading={false} error={null} onClose={onClose} />);

    fireEvent.click(screen.getByText('Classic Oatmeal'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders all ingredients with quantities', () => {
    render(<RecipeModal recipe={mockRecipe} isLoading={false} error={null} onClose={onClose} />);

    expect(screen.getByText('Rolled Oats')).toBeInTheDocument();
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('Honey')).toBeInTheDocument();
  });

  it('renders ingredient notes', () => {
    render(<RecipeModal recipe={mockRecipe} isLoading={false} error={null} onClose={onClose} />);

    expect(screen.getByText(/old-fashioned/)).toBeInTheDocument();
    expect(screen.getByText(/optional/)).toBeInTheDocument();
  });

  it('renders all instruction steps', () => {
    render(<RecipeModal recipe={mockRecipe} isLoading={false} error={null} onClose={onClose} />);

    expect(screen.getByText('Bring water to a boil.')).toBeInTheDocument();
    expect(screen.getByText('Add oats and reduce heat.')).toBeInTheDocument();
    expect(screen.getByText('Cook for 5 minutes, stirring occasionally.')).toBeInTheDocument();
  });

  it('renders copy and save buttons', () => {
    render(<RecipeModal recipe={mockRecipe} isLoading={false} error={null} onClose={onClose} />);

    expect(screen.getByText(/Copy to Clipboard/)).toBeInTheDocument();
    expect(screen.getByText(/Save as Markdown/)).toBeInTheDocument();
  });

  it('does not render action buttons while loading', () => {
    render(<RecipeModal recipe={null} isLoading={true} error={null} onClose={onClose} />);

    expect(screen.queryByText(/Copy to Clipboard/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Save as Markdown/)).not.toBeInTheDocument();
  });
});
