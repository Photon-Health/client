import { render, screen } from '@solidjs/testing-library';
import { test, vi } from 'vitest';
import '@testing-library/jest-dom';
import ComboBox from './index';
import userEvent from '@testing-library/user-event';

test('combobox only calls setSelected callback when value actually changes', async () => {
  const setSelected = vi.fn();
  const user = userEvent.setup();

  render(() => (
    <ComboBox setSelected={setSelected} value="test-value-1">
      <ComboBox.Input label="Test Label" displayValue={(val) => val}></ComboBox.Input>
      <ComboBox.Options>
        <ComboBox.Option key="test-key-1" value="test-value-1">
          Test Option 1
        </ComboBox.Option>
        <ComboBox.Option key="test-key-2" value="test-value-2">
          Test Option 2
        </ComboBox.Option>
      </ComboBox.Options>
    </ComboBox>
  ));

  await openComboBox(user, 'Test Label');
  expect(setSelected).toHaveBeenCalledTimes(0);

  await user.click(screen.getByText('Test Option 1'));
  expect(setSelected).toHaveBeenCalledTimes(0);

  await openComboBox(user, 'Test Label');
  await user.click(screen.getByText('Test Option 2'));
  expect(setSelected).toHaveBeenCalledTimes(1);
  expect(setSelected).toHaveBeenLastCalledWith('test-value-2');
});

// helpers
const openComboBox = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  await user.click(screen.getByLabelText(label));
};
