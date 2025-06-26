import { Order } from '../utils/models';

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
  readyBy: 'Regular',
  state: 'CANCELED',
  isReroutable: false,
  exceptions: [],
  fills: [],
  fulfillments: [],
  discountCards: [],
  ...overrides
});

export const generatePatient = (overrides: Partial<Order['patient']> = {}): Order['patient'] => ({
  id: 'pat_defaultTestId',
  name: { full: 'John Doe' },
  ...overrides
});
