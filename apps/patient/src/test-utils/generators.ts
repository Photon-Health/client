import { Order } from '../utils/models';
import { FillWithCount } from '../utils/general';
import { type Offer, type Pharmacy } from '../__generated__/graphql';

export const generateId = (prefix?: string) => `${prefix}${Math.random().toString(16).slice(2)}`;

export const generateOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'ord_test_defaultId',
  patient: generatePatient(),
  organization: {
    id: 'org_test_defaultId',
    name: 'Test Org'
  },
  address: {
    street1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: ''
  },
  readyBy: undefined,
  state: 'CANCELED',
  isReroutable: false,
  exceptions: [],
  fills: [],
  fulfillments: [],
  discountCards: [],
  ...overrides
});

type PatientOverrides = Partial<Omit<Order['patient'], 'name'>> & {
  name?: Partial<NonNullable<Order['patient']['name']>>;
};

export const generatePatient = (overrides: PatientOverrides = {}): Order['patient'] => {
  const { name: nameOverride, ...patientOverrides } = overrides;

  return {
    id: 'pat_defaultTestId',
    dateOfBirth: new Date(),
    sex: 'MALE',
    address: {
      id: 'addr_defaultTestId',
      street1: '123 Test St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US'
    },
    preferredPharmacies: [],
    ...patientOverrides,
    name: { full: 'John Doe', first: 'John', ...nameOverride }
  };
};

export const generateAddress = (
  overrides: Partial<NonNullable<Order['patient']['address']>> = {}
): NonNullable<Order['patient']['address']> => ({
  id: 'addr_defaultTestId',
  street1: '123 Test St',
  street2: undefined,
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'US',
  ...overrides
});

let fillIdCounter = 0;
export const generateFill = (treatmentName: string): Order['fills'][number] => {
  fillIdCounter += 1;
  return {
    id: `fil_testIdDefault_${fillIdCounter}`,
    state: 'SENT',
    treatment: {
      id: `med_testIdDefault_${fillIdCounter}`,
      name: treatmentName
    },
    prescription: {
      id: `rx_testIdDefault_${fillIdCounter}`,
      daysSupply: undefined,
      dispenseQuantity: 0,
      dispenseUnit: '',
      dispenseAsWritten: false,
      expirationDate: undefined,
      fillsAllowed: 0,
      provider: {
        id: 'prv_test_default',
        name: {
          full: 'Jane Provider',
          last: 'Provider',
          title: undefined
        }
      }
    }
  };
};

type Fulfillment = Order['fulfillments'][number];
export const generateFulfillment = (overrides: Partial<Fulfillment> = {}): Fulfillment => ({
  id: `ful_testIdDefault`,
  state: 'READY',
  exceptions: [],
  prescription: generatePrescription(),
  ...overrides
});

type Prescription = Fulfillment['prescription'];
export const generatePrescription = (): Prescription => ({
  id: `rx_testIdDefault`,
  dispenseQuantity: 0,
  dispenseUnit: '',
  expirationDate: undefined,
  fillsAllowed: 0,
  treatment: {
    __typename: undefined,
    id: '',
    name: ''
  }
});

export const generateFlattenedFill = (override: Partial<FillWithCount>): FillWithCount => ({
  id: `fil_testIdDefault`,
  state: 'SENT',
  count: 1,
  treatment: generateTreatment(),
  ...override
});

export const generateTreatment = (
  override: Partial<FillWithCount['treatment']> = {}
): FillWithCount['treatment'] => ({
  __typename: 'Medication',
  id: 'med_testIdDefault',
  name: 'test-treatment-name',
  therapeuticClassifications: [],
  ...override
});

export const generateOffer = (overrides: Partial<Offer> = {}): Offer => ({
  supplier: 'UNKNOWN',
  ...overrides
});

export const generateDiscountCard = (
  overrides: Partial<Order['discountCards'][number]> = {}
): Order['discountCards'][number] => ({
  id: 'dsc_test-default',
  prescriptionId: '',
  price: 1,
  bin: 'test-default-bin',
  pcn: 'test-default-pcn',
  group: 'test-default-group',
  memberId: 'test-default-member-id',
  pharmacyId: 'test-default-pharmacy-id',
  source: 'test-source',
  ...overrides
});

export const generatePharmacy = (overrides: Partial<Pharmacy> = {}): Pharmacy => ({
  id: 'phr_defaultTestId',
  name: 'default-test-pharmacy-name',
  ...overrides
});
