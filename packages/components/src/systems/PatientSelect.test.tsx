import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, afterEach, expect } from 'vitest';
import { PatientSelect } from './PatientSelect';
import { Patient } from '@photonhealth/sdk/dist/types';
import { PATIENT } from '@photonhealth/sdk/test-utils';

const makePatient = (overrides: Partial<Patient> = {}): Patient => ({
  ...PATIENT,
  ...overrides
});

// Preserving existing behavior of only fetching patients
// when user interacts with PatientSelect
test('calls onInitialFetch when dropdown opens and patient list is empty', async () => {
  const user = userEvent.setup();
  const onInitialFetch = vi.fn();

  render(() => (
    <PatientSelect
      patients={[]}
      loading={false}
      onInitialFetch={onInitialFetch}
      onSearch={vi.fn()}
      onSelect={vi.fn()}
    />
  ));

  await user.click(screen.getByPlaceholderText('Select patient...'));
  expect(onInitialFetch).toHaveBeenCalledTimes(1);
});

test('does not call onInitialFetch when dropdown opens and patient list is not empty', async () => {
  const user = userEvent.setup();
  const onInitialFetch = vi.fn();
  const patients = [makePatient()];

  render(() => (
    <PatientSelect
      patients={patients}
      loading={false}
      onInitialFetch={onInitialFetch}
      onSearch={vi.fn()}
      onSelect={vi.fn()}
    />
  ));

  await user.click(screen.getByPlaceholderText('Select patient...'));
  expect(onInitialFetch).not.toHaveBeenCalled();
});

test('places selected patient first in dropdown', async () => {
  const user = userEvent.setup();
  const selected = makePatient({
    id: 'pat_1',
    name: { first: 'Alice', last: 'Smith', full: 'Alice Smith' }
  });
  const other = makePatient({
    id: 'pat_2',
    name: { first: 'Bob', last: 'Jones', full: 'Bob Jones' }
  });

  render(() => (
    <PatientSelect
      selectedPatient={selected}
      patients={[other, selected]}
      loading={false}
      onInitialFetch={vi.fn()}
      onSearch={vi.fn()}
      onSelect={vi.fn()}
    />
  ));

  await user.click(screen.getByPlaceholderText('Select patient...'));
  const options = screen.getAllByRole('option');
  expect(options).toHaveLength(2);
  expect(options[0]).toHaveTextContent('Alice Smith');
  expect(options[1]).toHaveTextContent('Bob Jones');
});

describe('search', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test('calls onSearch with typed value', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    const onSearch = vi.fn();

    render(() => (
      <PatientSelect
        patients={[]}
        loading={false}
        onInitialFetch={vi.fn()}
        onSearch={onSearch}
        onSelect={vi.fn()}
      />
    ));

    await user.type(screen.getByPlaceholderText('Select patient...'), 'Alice');
    expect(onSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(250);
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('Alice');
  });

  test('calls onSearch after selecting a patient and altering the input value', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    const onSearch = vi.fn();
    const selected = makePatient({
      id: 'pat_1',
      name: { first: 'Alice', last: 'Smith', full: 'Alice Smith' }
    });

    render(() => (
      <PatientSelect
        selectedPatient={selected}
        patients={[selected]}
        loading={false}
        onInitialFetch={vi.fn()}
        onSearch={onSearch}
        onSelect={vi.fn()}
      />
    ));

    const input = screen.getByDisplayValue('Alice Smith');
    await user.type(input, '{backspace}');
    vi.advanceTimersByTime(250);

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('Alice Smit');
  });
});
