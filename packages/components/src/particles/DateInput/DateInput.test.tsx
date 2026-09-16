import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import DateInput from '.';

describe('DateInput', () => {
  it('keeps the native date picker', () => {
    render(() => <DateInput />);

    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'date');
  });

  it.each([
    ['1990-01-15', '1990-01-15'],
    ['1990/01/15', '1990-01-15'],
    ['1/15/1990', '1990-01-15'],
    ['01-15-1990', '1990-01-15'],
    ['15/01/1990', '1990-01-15'],
    ['Jan 15, 1990', '1990-01-15'],
    ['January 15 1990', '1990-01-15']
  ])('accepts a pasted %s date', (pastedValue, expectedValue) => {
    const onDateChange = vi.fn();
    render(() => <DateInput onDateChange={onDateChange} />);

    fireEvent.paste(screen.getByDisplayValue(''), {
      clipboardData: { getData: () => pastedValue }
    });

    expect(onDateChange).toHaveBeenCalledWith(expectedValue);
  });

  it('does not update for an invalid pasted date', () => {
    const onDateChange = vi.fn();
    render(() => <DateInput onDateChange={onDateChange} />);

    fireEvent.paste(screen.getByDisplayValue(''), {
      clipboardData: { getData: () => '2/30/1990' }
    });

    expect(onDateChange).not.toHaveBeenCalled();
  });
});
