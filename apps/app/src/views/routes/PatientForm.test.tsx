import { render } from '@testing-library/react';
import { PatientForm } from './PatientForm';
import { MemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';

test('PatientForm renders element', async () => {
  const { container } = render(
    <MemoryRouter>
      <PatientForm />
    </MemoryRouter>
  );

  expect(container.querySelector('photon-patient-page')).toBeTruthy();
});
