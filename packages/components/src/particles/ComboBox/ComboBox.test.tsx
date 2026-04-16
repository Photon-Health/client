import { render, screen } from '@solidjs/testing-library';
import { expect, test, vi } from 'vitest';
import '@testing-library/jest-dom';
import ComboBox from './index';
import userEvent from '@testing-library/user-event';
import { For } from 'solid-js';

// helpers
const openComboBox = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  await user.click(screen.getByLabelText(label));
};

type TestOption = { id: string; label: string; disabled?: boolean };

const OPTIONS: TestOption[] = [
  { id: 'opt-1', label: 'Option 1' },
  { id: 'opt-2', label: 'Option 2' }
];

function renderComboBox(props: {
  value?: TestOption;
  options?: TestOption[];
  setSelected?: ReturnType<typeof vi.fn>;
  onOpen?: ReturnType<typeof vi.fn>;
  showClear?: boolean;
}) {
  const setSelected = props.setSelected ?? vi.fn();
  const options = props.options ?? OPTIONS;
  render(() => (
    <ComboBox<TestOption> setSelected={setSelected} value={props.value} onOpen={props.onOpen}>
      <ComboBox.Input<TestOption>
        label="Test Label"
        displayValue={(val) => val?.label ?? ''}
        showClear={props.showClear}
      />
      <ComboBox.Options>
        <For each={options}>
          {(option) => (
            <ComboBox.Option key={option.id} value={option} disabled={option.disabled}>
              {option.label}
            </ComboBox.Option>
          )}
        </For>
      </ComboBox.Options>
    </ComboBox>
  ));
  return { setSelected };
}

test('options are not visible before the dropdown is opened', () => {
  renderComboBox({});
  expect(screen.queryByRole('option')).not.toBeInTheDocument();
});

test('options are visible after clicking the input', async () => {
  const user = userEvent.setup();
  renderComboBox({});

  await openComboBox(user, 'Test Label');
  expect(screen.getAllByRole('option')).toHaveLength(OPTIONS.length);
});

test('options render display values correctly', async () => {
  const user = userEvent.setup();
  renderComboBox({});

  await openComboBox(user, 'Test Label');
  OPTIONS.forEach((option) => {
    screen.getByRole('option', { name: option.label });
  });
});

test('calls onOpen when the dropdown is opened', async () => {
  const user = userEvent.setup();
  const onOpen = vi.fn();
  renderComboBox({ onOpen });

  await openComboBox(user, 'Test Label');
  expect(onOpen).toHaveBeenCalledTimes(1);
});

test('clicking an option calls setSelected with the correct value', async () => {
  const user = userEvent.setup();
  const { setSelected } = renderComboBox({});

  await openComboBox(user, 'Test Label');
  await user.click(screen.getByRole('option', { name: OPTIONS[1].label }));

  expect(setSelected).toHaveBeenCalledTimes(1);
  expect(setSelected).toHaveBeenCalledWith(OPTIONS[1]);
});

test('input reflects the display value of the selected item', () => {
  renderComboBox({ value: OPTIONS[0] });
  expect(screen.getByLabelText('Test Label')).toHaveValue(OPTIONS[0].label);
});

test('clear button is not shown without showClear', () => {
  renderComboBox({ value: OPTIONS[0] });
  expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument();
});

test('clear button calls setSelected with undefined', async () => {
  const user = userEvent.setup();
  const { setSelected } = renderComboBox({ value: OPTIONS[0], showClear: true });

  await user.click(screen.getByRole('button', { name: 'Clear selection' }));
  expect(setSelected).toHaveBeenCalledWith(undefined);
});

test('only call setSelected callback when value actually changes', async () => {
  const user = userEvent.setup();
  const { setSelected } = renderComboBox({ value: OPTIONS[0] });

  await openComboBox(user, 'Test Label');
  expect(setSelected).toHaveBeenCalledTimes(0);

  await user.click(screen.getByRole('option', { name: OPTIONS[0].label }));
  expect(setSelected).toHaveBeenCalledTimes(0);

  await openComboBox(user, 'Test Label');
  await user.click(screen.getByRole('option', { name: OPTIONS[1].label }));
  expect(setSelected).toHaveBeenCalledTimes(1);
  expect(setSelected).toHaveBeenLastCalledWith(OPTIONS[1]);
});

test('disabled option is rendered but cannot be selected', async () => {
  const user = userEvent.setup();
  const { setSelected } = renderComboBox({
    options: [
      { id: 'opt-1', label: 'Enabled Option' },
      { id: 'opt-2', label: 'Disabled Option', disabled: true }
    ]
  });

  await openComboBox(user, 'Test Label');

  const disabledOption = screen.getByRole('option', { name: 'Disabled Option' });
  expect(disabledOption).toHaveAttribute('aria-disabled', 'true');

  await user.click(disabledOption);
  expect(setSelected).not.toHaveBeenCalled();
});

test('option renders render prop component with internal state', async () => {
  const user = userEvent.setup();
  const CustomOption = (props: { value: TestOption; active: boolean }) => (
    <span>{`${props.value.label} - ${props.active ? 'active' : 'inactive'}`}</span>
  );

  render(() => (
    <ComboBox setSelected={vi.fn()} value={undefined}>
      <ComboBox.Input<TestOption> label="Test Label" displayValue={(val) => val?.label ?? ''} />
      <ComboBox.Options>
        <ComboBox.Option key={OPTIONS[0].id} value={OPTIONS[0]} render={CustomOption}>
          {OPTIONS[0].label}
        </ComboBox.Option>
      </ComboBox.Options>
    </ComboBox>
  ));

  await openComboBox(user, 'Test Label');
  screen.getByText(`${OPTIONS[0].label} - inactive`);

  await user.hover(screen.getByRole('option'));
  screen.getByText(`${OPTIONS[0].label} - active`);
});
