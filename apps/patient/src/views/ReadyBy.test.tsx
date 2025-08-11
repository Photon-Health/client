import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ReadyBy } from './ReadyBy';
import { OrderContext, OrderContextType } from './Main';
import { Order } from '../utils/models';
import { generateOrder, generatePatient } from '../test-utils/generators';
import userEvent from '@testing-library/user-event';

vi.mock('../components', () => ({
  PrescriptionsList: () => <div>Mock Prescriptions List</div>,
  FixedFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="fixed-footer">{children}</div>
  ),
  PoweredBy: () => <div data-testid="powered-by">Powered By</div>
}));

vi.mock('../api', () => ({
  geocode: vi.fn().mockResolvedValue({
    lat: 40.7128,
    lng: -74.006,
    address: '123 Main St, New York, NY 10001'
  })
}));

describe('ReadyBy', () => {
  const testOrder = generateOrder({
    patient: generatePatient({ name: { full: 'Jane Doe' } })
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders the canceled order heading', async () => {
    renderReadyBy({ order: testOrder });
    expect(
      await screen.findByRole('heading', { name: 'When do you need your order ready by?' })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText('Urgent'));
    await userEvent.click(screen.getByText('Next'));
  });
});

const renderReadyBy = (orderContextValueOverride: Partial<OrderContextType> = {}) => {
  const orderContextValue: OrderContextType = {
    fetchOrder(currentPharmacy: Order['pharmacy'] | undefined): void {},
    flattenedFills: [],
    isDemo: false,
    logo: undefined,
    order: generateOrder(),
    setFaqModalIsOpen(isOpen: boolean): void {},
    setOrder(order: Order): void {},
    ...orderContextValueOverride
  };
  return render(
    <MemoryRouter>
      <ChakraProvider>
        <OrderContext.Provider value={orderContextValue}>
          <ReadyBy />
        </OrderContext.Provider>
      </ChakraProvider>
    </MemoryRouter>
  );
};
