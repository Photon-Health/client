import type { Patient, Pharmacy } from '@photonhealth/sdk/dist/types';

export function generatePatient(overrides: Partial<Patient> = {}): Patient {
  return {
    __typename: 'Patient',
    id: 'pat_123',
    externalId: 'ext_pat_123',
    name: { __typename: 'Name', full: 'Sally Patient' },
    dateOfBirth: '1990-01-01',
    sex: 'FEMALE',
    gender: 'female',
    email: 'sally@example.com',
    phone: '+17185551234',
    address: null,
    ...overrides
  } as Patient;
}
export function generateAddress(overrides: Partial<Address> = {}): Address {
  return {
    __typename: 'Address',
    id: 'addr_1',
    name: null,
    street1: '1 Main',
    street2: null,
    city: 'NY',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
    ...overrides
  } as Patient;
}

export function generatePharmacy(overrides: Partial<Pharmacy> = {}): Pharmacy {
  return {
    __typename: 'Pharmacy',
    id: 'phr_123',
    name: 'Test Pharmacy',
    address: {
      __typename: 'Address',
      street1: '1 Main',
      city: 'NY',
      state: 'NY',
      postalCode: '10001',
      country: 'US'
    },
    ...overrides
  } as Pharmacy;
}
