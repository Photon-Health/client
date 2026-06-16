import { Address, Patient, Pharmacy, SexType } from '@photonhealth/sdk/dist/types';
import {
  DiagnosisCodeType,
  MeUserQueryQuery,
  SupervisorCardFragment
} from '@photonhealth/sdk/dist/clinical-api/types';

type MeUser = MeUserQueryQuery['me'];

export function generatePatient(overrides: Partial<Patient> = {}): Patient {
  return {
    __typename: 'Patient',
    id: 'pat_123',
    externalId: 'ext_pat_123',
    name: {
      __typename: 'Name',
      full: 'Sally Patient',
      first: 'Sally',
      last: 'Patient'
    },
    dateOfBirth: '1990-01-01',
    sex: SexType.Female,
    gender: 'female',
    email: 'sally@example.com',
    phone: '+17185551234',
    address: null,
    ...overrides
  };
}
export function generateAddress(overrides: Partial<Address> = {}): Address {
  return {
    id: undefined,
    name: null,
    street1: '1 Main',
    street2: null,
    city: 'NY',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
    ...overrides
  };
}

export type SupervisorPrefillShape = {
  firstName: string;
  lastName: string;
  npi: string;
  phone: string;
  address: Address;
};

export function generateSupervisorPrefill(
  overrides: Partial<SupervisorPrefillShape> = {}
): SupervisorPrefillShape {
  return {
    firstName: 'Jane',
    lastName: 'Doe',
    address: generateAddress({
      country: 'US',
      city: 'Brooklyn',
      postalCode: '11120',
      state: 'NY',
      street1: '201 N 8th St',
      street2: null
    }),
    npi: '1234567890',
    phone: '+11234567890',
    ...overrides
  };
}

export function generateGqlSupervisor(
  overrides: Partial<SupervisorCardFragment> = {}
): SupervisorCardFragment {
  return {
    __typename: 'Supervisor',
    id: 'sup_defaultTestId',
    firstName: 'test-supervisor-fn',
    lastName: 'test-supervisor-ln',
    npi: 'test-supervisor-npi',
    ...overrides
  };
}

export function generateUser(overrides: Partial<MeUser> = {}): MeUser {
  return {
    __typename: 'User',
    id: 'usr_testId1111',
    credentials: null,
    address: { __typename: 'Address', state: 'CA' },
    ...overrides
  };
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
  };
}

type DiagnosisCodePrefillShape = {
  code: string;
  type: DiagnosisCodeType | string;
};

export function generateDiagnosisCodePrefill(
  overrides: Partial<DiagnosisCodePrefillShape> = {}
): DiagnosisCodePrefillShape {
  return {
    code: 'test-code',
    type: 'ICD10',
    ...overrides
  };
}
