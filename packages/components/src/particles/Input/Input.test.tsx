import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import Input from '.';

const user = userEvent.setup();

describe('Input', () => {
  it('should render the app', () => {
    const { getByPlaceholderText } = render(() => <Input placeholder="Sup" />);
    expect(getByPlaceholderText('Sup')).toBeInTheDocument();
  });

  it('should write a decimal number correctly if input is number type', async () => {
    const { getByPlaceholderText } = render(() => <Input placeholder="Number" type="number" />);
    const numberInput = getByPlaceholderText('Number');
    expect(numberInput).toBeInTheDocument();
    await user.type(numberInput, '12.34');
    expect(numberInput).toHaveValue(12.34);
  });
});
