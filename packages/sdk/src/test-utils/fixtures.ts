import { Patient } from '../types';

export const PATIENT = {
  __typename: 'Patient',
  id: 'pat_123',
  externalId: 'ext_pat_123',
  name: {
    __typename: 'Name',
    full: 'Sally Patient',
    first: 'Sally',
    middle: null,
    last: 'Patient',
    title: 'Ms.'
  },
  dateOfBirth: '1990-01-01',
  sex: 'FEMALE',
  gender: 'female',
  email: 'sally@example.com',
  phone: '+17185551234',
  address: null,
  preferredPharmacies: []
} as Patient;

export const TREATMENT = {
  __typename: 'Treatment',
  id: 'trt_123',
  name: 'Amoxicillin 500mg capsule',
  codes: {}
};

export const DISPENSE_UNIT = {
  id: 'du_123',
  name: 'Tablet'
};

export const PROVIDER = {
  id: 'prov_1',
  email: 'doc@test.com',
  credentials: 'MD',
  name: {
    first: 'Test',
    full: 'Test Doc',
    last: 'Doc',
    middle: null,
    title: 'Dr. '
  }
};

export const ORGANIZATION = {
  id: 'org_1',
  name: 'Test Org',
  customer: { id: 'cust_1', name: 'Test Customer' }
};
