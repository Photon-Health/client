import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom';
import DoseCalculator from '.';

describe('App', () => {
  it('should render the app', () => {
    const { getByText } = render(() => (
      <DoseCalculator open={true} onClose={() => {}} setAutocompleteValues={() => {}} />
    ));
    expect(getByText('Calculate Dose Quantity')).toBeInTheDocument();
  });

  it('should render the provided medication name', () => {
    const testMedicationName = 'Test Medication';
    const { getByText } = render(() => (
      <DoseCalculator
        open={true}
        onClose={() => {}}
        setAutocompleteValues={() => {}}
        medicationName={testMedicationName}
      />
    ));
    expect(getByText(testMedicationName)).toBeInTheDocument();
  });
});
