import { render, screen } from '@solidjs/testing-library';
import { test, vi } from 'vitest';
import '@testing-library/jest-dom';
import ComboBox from './index';
import userEvent from '@testing-library/user-event';
import { For } from 'solid-js';

test('combobox only calls setSelected callback when value actually changes', async () => {
  const setSelected = vi.fn();
  const user = userEvent.setup();

  const options = [
    { id: 'test-value-1', label: 'Test Option 1' },
    { id: 'test-value-2', label: 'Test Option 2' }
  ];

  render(() => (
    <ComboBox setSelected={setSelected} value={options[0]}>
      <ComboBox.Input label="Test Label" displayValue={(val) => val.label} />
      <ComboBox.Options>
        <For each={options}>
          {(option) => (
            <ComboBox.Option key={option.id} value={option}>
              {option.label}
            </ComboBox.Option>
          )}
        </For>
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
  expect(setSelected).toHaveBeenLastCalledWith(options[1]);
});

// helpers
const openComboBox = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  await user.click(screen.getByLabelText(label));
};
