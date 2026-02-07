import React from 'react';
import { render, screen } from '@testing-library/react';
import ShoppingListDisplay from './ShoppingListDisplay';

const mockShoppingList = {
  items: [
    { name: 'Chicken breast', totalQuantity: '3', unit: 'lbs', category: 'Meat & Seafood' },
    { name: 'Broccoli', totalQuantity: '2', unit: 'heads', category: 'Produce' },
    { name: 'Greek yogurt', totalQuantity: '4', unit: 'cups', category: 'Dairy' },
    { name: 'Rice', totalQuantity: '5', unit: 'cups', category: 'Pantry' },
    { name: 'Apples', totalQuantity: '7', unit: 'pieces', category: 'Produce' },
  ],
};

describe('ShoppingListDisplay', () => {
  it('renders shopping list title', () => {
    render(<ShoppingListDisplay shoppingList={mockShoppingList} />);
    expect(screen.getByText(/Shopping List/)).toBeInTheDocument();
  });

  it('groups items by category', () => {
    render(<ShoppingListDisplay shoppingList={mockShoppingList} />);
    expect(screen.getByText('Produce')).toBeInTheDocument();
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    expect(screen.getByText('Meat & Seafood')).toBeInTheDocument();
    expect(screen.getByText('Pantry')).toBeInTheDocument();
  });

  it('displays all items with quantities', () => {
    render(<ShoppingListDisplay shoppingList={mockShoppingList} />);
    expect(screen.getByText('Chicken breast')).toBeInTheDocument();
    expect(screen.getByText('3 lbs')).toBeInTheDocument();
    expect(screen.getByText('Broccoli')).toBeInTheDocument();
    expect(screen.getByText('Apples')).toBeInTheDocument();
  });

  it('renders copy and download buttons', () => {
    render(<ShoppingListDisplay shoppingList={mockShoppingList} />);
    expect(screen.getByText(/Copy to Clipboard/)).toBeInTheDocument();
    expect(screen.getByText(/Save as Markdown/)).toBeInTheDocument();
  });
});
