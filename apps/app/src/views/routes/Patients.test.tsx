import { lambdasGql } from '@photonhealth/sdk/test-utils';
import { screen } from '@testing-library/react';
import { HttpResponse } from 'msw';
import { beforeEach, expect, test } from 'vitest';

import { makePatient, setupHarness } from '../../test-utils';
import { Patients } from './Patients';

const { server, renderWithProviders } = setupHarness();

const patientWithAddress = makePatient({
  id: 'pat_with_address',
  name: { __typename: 'Name', full: 'Sally Patient' } as never,
  address: {
    __typename: 'Address',
    street1: '106 n 7th st',
    street2: 'apt 2',
    city: 'brooklyn',
    state: 'NY',
    postalCode: '11249'
  } as never
});

const patientWithoutAddress = makePatient({
  id: 'pat_without_address',
  name: { __typename: 'Name', full: 'Pat Noaddress' } as never,
  address: null as never
});

beforeEach(() => {
  server.use(
    lambdasGql.query('GetPatients', () =>
      HttpResponse.json({ data: { patients: [patientWithAddress, patientWithoutAddress] } })
    )
  );
});

test('shows an Address column header', async () => {
  renderWithProviders(<Patients />);
  await screen.findByText('Sally Patient');
  expect(screen.getByRole('columnheader', { name: 'Address' })).toBeInTheDocument();
});

test("renders each patient's formatted address", async () => {
  renderWithProviders(<Patients />);
  expect(await screen.findByText('106 N 7th St, Apt 2')).toBeInTheDocument();
  expect(screen.getByText('Brooklyn, NY 11249')).toBeInTheDocument();
});

test('shows None when a patient has no address', async () => {
  renderWithProviders(<Patients />);
  await screen.findByText('Pat Noaddress');
  expect(screen.getAllByText('None').length).toBeGreaterThan(0);
});
