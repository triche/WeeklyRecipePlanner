import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DayOfWeekSelector from './DayOfWeekSelector';
import { ALL_DAYS, DayOfWeek } from '../types';

describe('DayOfWeekSelector', () => {
  it('renders all seven days', () => {
    render(<DayOfWeekSelector selectedDays={[...ALL_DAYS]} onChange={vi.fn()} />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(7);
    expect(screen.getByLabelText('Monday')).toBeInTheDocument();
    expect(screen.getByLabelText('Sunday')).toBeInTheDocument();
  });

  it('shows all days as active when all selected', () => {
    render(<DayOfWeekSelector selectedDays={[...ALL_DAYS]} onChange={vi.fn()} />);
    const chips = screen.getAllByRole('checkbox');
    chips.forEach((chip) => {
      expect(chip).toHaveAttribute('aria-checked', 'true');
    });
  });

  it('shows deselected days as inactive', () => {
    const days: DayOfWeek[] = ['Monday', 'Wednesday', 'Friday'];
    render(<DayOfWeekSelector selectedDays={days} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Monday')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText('Tuesday')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByLabelText('Wednesday')).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange without the day when toggling off', () => {
    const onChange = vi.fn();
    render(<DayOfWeekSelector selectedDays={[...ALL_DAYS]} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Wednesday'));
    expect(onChange).toHaveBeenCalledWith(
      ALL_DAYS.filter((d) => d !== 'Wednesday')
    );
  });

  it('calls onChange with the day added in canonical order when toggling on', () => {
    const onChange = vi.fn();
    const days: DayOfWeek[] = ['Monday', 'Friday'];
    render(<DayOfWeekSelector selectedDays={days} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Wednesday'));
    expect(onChange).toHaveBeenCalledWith(['Monday', 'Wednesday', 'Friday']);
  });

  it('does not allow deselecting the last remaining day', () => {
    const onChange = vi.fn();
    render(<DayOfWeekSelector selectedDays={['Monday']} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Monday'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders short labels (Mon, Tue, ...)', () => {
    render(<DayOfWeekSelector selectedDays={[...ALL_DAYS]} onChange={vi.fn()} />);
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });
});
