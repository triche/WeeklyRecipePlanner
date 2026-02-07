import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, beforeEach, afterEach } from 'vitest';
import DevConsole from './DevConsole';
import devLogger from '../services/devLogger';

describe('DevConsole', () => {
  beforeEach(() => {
    devLogger.install();
  });

  afterEach(() => {
    devLogger.clear();
    devLogger.uninstall();
  });

  it('renders nothing when visible is false', () => {
    render(<DevConsole visible={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId('dev-console')).not.toBeInTheDocument();
  });

  it('renders the console panel when visible is true', () => {
    render(<DevConsole visible={true} onClose={vi.fn()} />);
    expect(screen.getByTestId('dev-console')).toBeInTheDocument();
    expect(screen.getByText(/Dev Console/)).toBeInTheDocument();
  });

  it('displays log entries from devLogger', () => {
    render(<DevConsole visible={true} onClose={vi.fn()} />);

    act(() => {
      console.log('test message from logger');
    });

    expect(screen.getByText(/test message from logger/)).toBeInTheDocument();
  });

  it('displays error entries with error styling class', () => {
    render(<DevConsole visible={true} onClose={vi.fn()} />);

    act(() => {
      console.error('something went wrong');
    });

    const entry = screen.getByText(/something went wrong/).closest('.dev-console-entry');
    expect(entry).toHaveClass('error');
  });

  it('displays warn entries', () => {
    render(<DevConsole visible={true} onClose={vi.fn()} />);

    act(() => {
      console.warn('deprecation warning');
    });

    expect(screen.getByText(/deprecation warning/)).toBeInTheDocument();
  });

  it('clears entries when clear button is clicked', () => {
    render(<DevConsole visible={true} onClose={vi.fn()} />);

    act(() => {
      console.log('message to be cleared');
    });

    expect(screen.getByText(/message to be cleared/)).toBeInTheDocument();

    const clearBtn = screen.getByTitle('Clear console');
    fireEvent.click(clearBtn);

    expect(screen.queryByText(/message to be cleared/)).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<DevConsole visible={true} onClose={onClose} />);

    const closeBtn = screen.getByTitle('Close console');
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('filters entries by level', () => {
    render(<DevConsole visible={true} onClose={vi.fn()} />);

    act(() => {
      console.log('a log message');
      console.error('an error message');
      console.warn('a warn message');
    });

    // All visible by default
    expect(screen.getByText(/a log message/)).toBeInTheDocument();
    expect(screen.getByText(/an error message/)).toBeInTheDocument();
    expect(screen.getByText(/a warn message/)).toBeInTheDocument();

    // Filter to errors only
    fireEvent.click(screen.getByLabelText('Filter error'));

    expect(screen.queryByText(/a log message/)).not.toBeInTheDocument();
    expect(screen.getByText(/an error message/)).toBeInTheDocument();
    expect(screen.queryByText(/a warn message/)).not.toBeInTheDocument();

    // Back to all
    fireEvent.click(screen.getByLabelText('Filter all'));
    expect(screen.getByText(/a log message/)).toBeInTheDocument();
  });

  it('shows error and warning count badges', () => {
    render(<DevConsole visible={true} onClose={vi.fn()} />);

    act(() => {
      console.error('err1');
      console.error('err2');
      console.warn('warn1');
    });

    // There should be at least one badge inside the error filter button
    const errorFilterBtn = screen.getByLabelText('Filter error');
    const errorBadge = errorFilterBtn.querySelector('.dev-console-badge.error');
    expect(errorBadge).toBeTruthy();
    expect(Number(errorBadge!.textContent)).toBeGreaterThanOrEqual(2);

    const warnFilterBtn = screen.getByLabelText('Filter warn');
    const warnBadge = warnFilterBtn.querySelector('.dev-console-badge.warn');
    expect(warnBadge).toBeTruthy();
    expect(Number(warnBadge!.textContent)).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state when no matching entries for a level', () => {
    render(<DevConsole visible={true} onClose={vi.fn()} />);

    // Filter to warnings — no console.warn() was called in this test
    fireEvent.click(screen.getByLabelText('Filter warn'));

    expect(screen.getByText(/No log entries/)).toBeInTheDocument();
  });

  it('expands error details when entry is clicked', () => {
    render(<DevConsole visible={true} onClose={vi.fn()} />);

    act(() => {
      console.error('fail', new Error('Something broke'));
    });

    // Details should not initially be expanded (no <pre> with stack)
    const expandIndicators = screen.getAllByText('▶');
    expect(expandIndicators.length).toBeGreaterThan(0);

    // Click the entry to expand
    const entry = screen.getByText(/fail/).closest('.dev-console-entry');
    fireEvent.click(entry!);

    // The expand indicator should now be ▼
    expect(screen.getByText('▼')).toBeInTheDocument();
    // Stack trace should be visible
    expect(screen.getByText(/Something broke/)).toBeInTheDocument();
  });
});
