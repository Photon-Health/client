import { render } from '@solidjs/testing-library';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import DoseCalculator from '.';

describe('DoseCalculator', () => {
  it('should render the app', () => {
    const { getByText } = render(() => (
      <DoseCalculator open={true} onClose={() => {}} setAutocompleteValues={() => {}} />
    ));
    expect(getByText('Calculate Dose Quantity')).toBeInTheDocument();
  });

  it('should calculate "Amoxicillin 200 MG in 5mL Oral Suspension, 20lbs, 80 mg/kg" correctly', async () => {
    const medicationName = 'Amoxicillin 200 MG in 5mL Oral Suspension, 20lbs, 80 mg/kg';
    const setAutocompleteValuesMock = vi.fn();

    const { getByText, getByLabelText, container } = render(() => (
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
    await userEvent.type(getByLabelText('Dose'), '90');
    await userEvent.type(getByLabelText('Patient Weight'), '20');
    await userEvent.type(getByLabelText('Liquid Concentration'), '200');
    await userEvent.type(getByLabelText('Per Volume'), '5');
    await userEvent.clear(getByLabelText('Duration in Days'));
    await userEvent.type(getByLabelText('Duration in Days'), '10');
    await userEvent.clear(getByLabelText('Doses per Day'));
    await userEvent.type(getByLabelText('Doses per Day'), '2');

    // console.log(container.innerHTML);
    await userEvent.click(getByText('Autofill'));

    expect(setAutocompleteValuesMock).toHaveBeenCalledTimes(1);
    expect(setAutocompleteValuesMock).toHaveBeenCalledWith({
      liquidDose: 10.2,
      totalLiquid: 204.1,
      unit: 'mL'
    });
  });
});
