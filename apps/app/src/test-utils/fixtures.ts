// Pure data factories for the clinical-app test suite. No side effects, no
// shared state — every call returns a fresh object built from defaults with
// shallow overrides applied last. Use `as unknown as T` casts to keep the
// fixtures from re-asserting every nullable field in the generated GraphQL
// types; tests only need the fields they assert against.
import type {
  Address,
  Fill,
  Order,
  Patient,
  Pharmacy,
  Treatment
} from '@photonhealth/sdk/dist/types';
import { OrderState } from '@photonhealth/sdk/dist/types';

export function makeAddress(overrides: Partial<Address> = {}): Address {
  return {
    __typename: 'Address',
    street1: '123 Main St',
    street2: null,
    city: 'Brooklyn',
    state: 'NY',
    postalCode: '11211',
    country: 'US',
    ...overrides
  } as unknown as Address;
}

export function makePharmacy(overrides: Partial<Pharmacy> = {}): Pharmacy {
  return {
    __typename: 'Pharmacy',
    id: 'phr_default',
    name: 'Default Pharmacy',
    phone: '+15550000000',
    address: makeAddress(),
    ...overrides
  } as unknown as Pharmacy;
}

export function makeTreatment(overrides: Partial<Treatment> = {}): Treatment {
  return {
    __typename: 'Treatment',
    id: 'trt_default',
    name: 'Default Treatment',
    ...overrides
  } as unknown as Treatment;
}

export function makeFill(overrides: Partial<Fill> = {}): Fill {
  return {
    __typename: 'Fill',
    id: 'fill_default',
    state: 'NEW',
    requestedAt: '2026-01-01T00:00:00Z',
    filledAt: null,
    treatment: makeTreatment(),
    prescription: {
      __typename: 'Prescription',
      id: 'rx_default',
      dispenseQuantity: 30,
      dispenseUnit: 'tablet',
      fillsAllowed: 1,
      instructions: 'Take as directed'
    },
    ...overrides
  } as unknown as Fill;
}

export function makePatient(overrides: Partial<Patient> = {}): Patient {
  return {
    __typename: 'Patient',
    id: 'pat_default',
    externalId: null,
    name: { __typename: 'Name', full: 'Sally Patient' },
    dateOfBirth: '1990-01-01',
    sex: 'FEMALE',
    gender: 'female',
    email: 'sally@example.com',
    phone: '+17185551234',
    address: null,
    preferredPharmacies: [],
    ...overrides
  } as unknown as Patient;
}

export function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    __typename: 'Order',
    id: 'ord_default',
    externalId: null,
    state: OrderState.Routing,
    address: null,
    fills: [makeFill()],
    patient: makePatient(),
    pharmacy: makePharmacy(),
    fulfillment: null,
    exceptions: [],
    createdAt: '2026-01-01T00:00:00Z',
    supervisor: null,
    ...overrides
  } as unknown as Order;
}
