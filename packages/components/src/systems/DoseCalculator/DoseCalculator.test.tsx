import { render } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import DoseCalculator from '.';

const user = userEvent.setup();

describe('DoseCalculator', () => {
  it('should render the app', () => {
    const { getByText } = render(() => (
      <DoseCalculator open={true} onClose={() => {}} setAutocompleteValues={() => {}} />
    ));
    expect(getByText('Calculate Dose Quantity')).toBeInTheDocument();
  });

  it('should calculate "Amoxicillin 200 MG in 5mL Oral Suspension, 20lbs, 80 mg/kg, 2x per day for 10 days" correctly', async () => {
    const medicationName = 'Amoxicillin 200 MG in 5mL Oral Suspension, 20lbs, 80 mg/kg';
    const setAutocompleteValuesMock = vi.fn();

    const { getByText, getByLabelText } = render(() => (
      <DoseCalculator
        open={true}
        onClose={() => {}}
        setAutocompleteValues={setAutocompleteValuesMock}
        medicationName={medicationName}
      />
    ));

    // Check that the medication name is rendered
    expect(getByText(medicationName)).toBeInTheDocument();

    // Set input values
    await user.type(getByLabelText('Dose'), '90');
    await user.type(getByLabelText('Patient Weight'), '20');
    await user.type(getByLabelText('Liquid Concentration'), '200');
    await user.type(getByLabelText('Per Volume'), '5');
    await user.clear(getByLabelText('Duration in Days'));
    await user.type(getByLabelText('Duration in Days'), '10');
    await user.clear(getByLabelText('Doses per Day'));
    await user.type(getByLabelText('Doses per Day'), '2');

    await user.click(getByText('Autofill'));

    expect(setAutocompleteValuesMock).toHaveBeenCalledTimes(1);
    expect(setAutocompleteValuesMock).toHaveBeenCalledWith({
      days: 10,
      liquidDose: 10.2,
      totalLiquid: 204.1,
      unit: 'mL'
    });
  });

  it('should calculate "cefdinir 250 mg / 5 ml common dose is 300 mg, 2x per day for 10 days" correctly', async () => {
    const setAutocompleteValuesMock = vi.fn();

    const { getByText, getByLabelText, getByDisplayValue, getAllByRole } = render(() => (
      <DoseCalculator
        open={true}
        onClose={() => {}}
        setAutocompleteValues={setAutocompleteValuesMock}
      />
    ));

    // Set input values
    await user.type(getByLabelText('Dose'), '7');

    // select dose from the dropdown
    const dayOrDoseComboInput = getByDisplayValue('day');
    await user.click(dayOrDoseComboInput);
    const option = getAllByRole('option').find((option) => option.textContent === 'dose');
    await user.click(option as HTMLElement);

    await user.type(getByLabelText('Patient Weight'), '20');
    await user.type(getByLabelText('Liquid Concentration'), '250');
    await user.type(getByLabelText('Per Volume'), '5');
    await user.clear(getByLabelText('Duration in Days'));
    await user.type(getByLabelText('Duration in Days'), '10');
    await user.clear(getByLabelText('Doses per Day'));
    await user.type(getByLabelText('Doses per Day'), '2');

    await user.click(getByText('Autofill'));

    expect(setAutocompleteValuesMock).toHaveBeenCalledTimes(1);
    expect(setAutocompleteValuesMock).toHaveBeenCalledWith({
      days: 10,
      liquidDose: 1.3,
      totalLiquid: 25.4,
      unit: 'mL'
    });
  });

  it('should calculate "dexamethasone 1 MG in 1mL concentrate for Oral suspension" correctly', async () => {
    const setAutocompleteValuesMock = vi.fn();

    const { getByText, getByLabelText, getAllByRole, getByDisplayValue } = render(() => (
      <DoseCalculator
        open={true}
        onClose={() => {}}
        setAutocompleteValues={setAutocompleteValuesMock}
      />
    ));

    // Set input values
    await user.type(getByLabelText('Dose'), '0.6');

    // select dose from the dropdown
    const dayOrDoseComboInput = getByDisplayValue('day');
    await user.click(dayOrDoseComboInput);
    const option = getAllByRole('option').find((option) => option.textContent === 'dose');
    await user.click(option as HTMLElement);

    await user.type(getByLabelText('Patient Weight'), '20');
    await user.type(getByLabelText('Liquid Concentration'), '1');
    await user.type(getByLabelText('Per Volume'), '1');
    await user.clear(getByLabelText('Duration in Days'));
    await user.type(getByLabelText('Duration in Days'), '1');
    await user.clear(getByLabelText('Doses per Day'));
    await user.type(getByLabelText('Doses per Day'), '1');

    await user.click(getByText('Autofill'));
    expect((getByLabelText('Single Dose') as HTMLInputElement).value).toEqual('5.4 mg');
    expect((getByLabelText('Total Quantity') as HTMLInputElement).value).toEqual('5.4 mg');
    expect(setAutocompleteValuesMock).toHaveBeenCalledTimes(1);
    expect(setAutocompleteValuesMock).toHaveBeenCalledWith({
      days: 1,
      liquidDose: 5.4,
      totalLiquid: 5.4,
      unit: 'mL'
    });
  });

  it('should not return NaN or Infinity', async () => {
    const { getByText, getByLabelText, container } = render(() => (
      <DoseCalculator open={true} onClose={() => {}} setAutocompleteValues={() => {}} />
    ));

    // Set input values
    await user.type(getByLabelText('Dose'), '90');
    await user.type(getByLabelText('Patient Weight'), '20');
    await user.type(getByLabelText('Liquid Concentration'), '200');
    await user.type(getByLabelText('Per Volume'), '5');
    await user.clear(getByLabelText('Duration in Days'));
    await user.type(getByLabelText('Duration in Days'), '10');
    await user.clear(getByLabelText('Doses per Day'));
    await user.type(getByLabelText('Doses per Day'), '0');

    const autofillButton = getByText('Autofill');
    expect(autofillButton).toBeDisabled();
  });
});
