import { Patient, Prescription, PrescriptionState } from '../types';

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
  __typename: 'Provider',
  id: 'usr_1',
  email: 'doc@test.com',
  credentials: 'MD',
  name: {
    first: 'Test',
    full: 'Test Doc',
    last: 'Doc',
    middle: null,
    title: 'Dr. '
  },
  NPI: null,
  address: null,
  externalId: null,
  fax: null,
  phone: '+17185559876',
  organizations: []
};

export const ORGANIZATION = {
  id: 'org_1',
  name: 'Test Org',
  customer: { id: 'cust_1', name: 'Test Customer' }
};

export const PRESCRIPTION = {
  __typename: 'Prescription',
  id: 'rx_123',
  externalId: 'ext_rx_123',
  daysSupply: 30,
  diagnoses: [],
  dispenseAsWritten: false,
  dispenseQuantity: 30,
  dispenseUnit: 'Tablet',
  effectiveDate: '2026-01-01',
  doNotFillBeforeDate: null,
  expirationDate: '2027-01-01',
  fills: [],
  fillsAllowed: 3,
  fillsRemaining: 3,
  instructions: 'Take 1 tablet by mouth once daily',
  notes: null,
  state: PrescriptionState.Active,
  writtenAt: '2026-01-01T00:00:00.000Z',
  patient: PATIENT,
  prescriber: PROVIDER,
  treatment: TREATMENT
} as Prescription;
