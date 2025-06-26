import { render, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import Input from '.';

const user = userEvent.setup();

describe('Input', () => {
  it('should render the app', () => {
    render(() => <Input placeholder="Sup" />);
    expect(screen.getByPlaceholderText('Sup')).toBeInTheDocument();
  });

  it('should write a decimal number correctly if input is number type', async () => {
    render(() => <Input placeholder="Number" type="number" />);
    const numberInput = screen.getByPlaceholderText('Number');
    expect(numberInput).toBeInTheDocument();
    await user.type(numberInput, '12.34');
    expect(numberInput).toHaveValue(12.34);
  });
});
