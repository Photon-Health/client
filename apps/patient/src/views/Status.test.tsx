import { vi } from 'vitest';
import { createMemoryRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import { routeElements } from '../Routes';
import { render, screen } from '@testing-library/react';
import {
  generateFill,
  generateOrder,
  generatePatient,
  generatePharmacy
} from '../test-utils/generators';
import { Order } from '../utils/models';

vi.mock('../api', () => ({
  triggerDemoNotification: vi.fn(),
  geocode: vi.fn().mockResolvedValue({
    lat: 0,
    lng: 0,
    address: 'mocked address'
  }),
  getOrder: vi.fn(),
  AUTH_HEADER_ERRORS: []
}));

vi.mock('@datadog/browser-rum');
vi.mock('../configs/analytics');
vi.mock('../hooks/usePageAnalytics');
vi.mock('react-ga4');

test('shows coupon external URL', async () => {
  renderAppAtStatusView();

  expect(await screen.findByText('Order is likely ready')).toBeInTheDocument();
});

const renderAppAtStatusView = async (orderOverrides: Partial<Order> = {}) => {
  const { getOrder } = await import('../api');
  const getOrderMock = vi.mocked(getOrder);
  const order = generateOrder({
    id: 'ord_statusViewTestId',
    state: 'PLACED',
    patient: generatePatient(),
    pharmacy: generatePharmacy(),
    fulfillment: {
      type: 'PICK_UP',
      state: ''
    },
    fulfillments: [
      {
        id: '',
        state: 'READY',
        exceptions: [],
        prescription: {
          __typename: undefined,
          id: '',
          daysSupply: undefined,
          dispenseQuantity: 0,
          dispenseUnit: '',
          expirationDate: undefined,
          fillsAllowed: 0,
          treatment: {
            __typename: undefined,
            id: '',
            name: ''
          }
        }
      }
    ],
    fills: [generateFill('test-treatment')],
    discountCards: [],
    ...orderOverrides
  });

  getOrderMock.mockResolvedValue(order);

  const mockToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';

  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [`/?token=${mockToken}`]
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};
