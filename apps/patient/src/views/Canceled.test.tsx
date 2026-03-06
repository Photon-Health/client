import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Canceled } from './Canceled';
import { OrderContext, OrderContextType } from './Main';
import { Order } from '../utils/models';
import { generateOrder, generatePatient } from '../test-utils/generators';

vi.mock('../components', () => ({
  PrescriptionsList: () => <div>Mock Prescriptions List</div>
}));

vi.mock('../api', () => ({
  geocode: vi.fn().mockResolvedValue({
    lat: 40.7128,
    lng: -74.006,
    address: '123 Main St, New York, NY 10001'
  })
}));

describe('Canceled', () => {
  const testOrder = generateOrder({
    patient: generatePatient({ name: { full: 'Jane Doe' } })
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    renderCanceled({ order: testOrder });
  });

  it('renders the canceled order heading', () => {
    expect(screen.getByRole('heading', { name: 'This order was canceled.' })).toBeInTheDocument();
  });

  it('displays the patient name', () => {
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('renders the prescriptions list component', () => {
    expect(screen.getByText('Mock Prescriptions List')).toBeInTheDocument();
  });
});

const renderCanceled = (orderContextValueOverride: Partial<OrderContextType> = {}) => {
  const orderContextValue: OrderContextType = {
    fetchOrder(currentPharmacy: Order['pharmacy'] | undefined) {
      return Promise.resolve(undefined);
    },
    flattenedFills: [],
    isDemo: false,
    phone: null,
    demoToken: undefined,
    logo: undefined,
    order: generateOrder(),
    setFaqModalIsOpen(isOpen: boolean): void {},
    setOrder(order: Order): void {},
    enablePrice: false,
    showPriceToggle: true,
    setEnablePrice(enablePrice: boolean): void {},
    ...orderContextValueOverride
  };
  return render(
    <MemoryRouter>
      <ChakraProvider>
        <OrderContext.Provider value={orderContextValue}>
          <Canceled />
        </OrderContext.Provider>
      </ChakraProvider>
    </MemoryRouter>
  );
};
