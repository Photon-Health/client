import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { MarketplaceSummary } from './MarketplaceSummary';
import type { OrderContextType } from '../../../views/Main';
import { generateFill, generateOrder, generatePatient } from '../../../test-utils/generators';

vi.mock('../../../views/Main', () => {
  const React = require('react');
  const OrderContext = React.createContext(null);

  return {
    OrderContext,
    useOrderContext: () => {
      const context = React.useContext(OrderContext);
      if (!context) {
        throw new Error('OrderContext is required');
      }
      return context;
    }
  };
});

import { OrderContext } from '../../../views/Main';

const renderMarketplaceSummary = (orderContextValueOverride: Partial<OrderContextType> = {}) => {
  const order = generateOrder({
    patient: generatePatient({ name: { full: 'John Doe', first: 'John' } }),
    fills: [generateFill('Metformin')]
  });

  const orderContextValue: OrderContextType = {
    fetchOrder() {
      return Promise.resolve(undefined);
    },
    flattenedFills: order.fills.map((fill) => ({
      ...fill,
      count: 1,
      treatment: fill.treatment
    })),
    isDemo: false,
    logo: undefined,
    order,
    setFaqModalIsOpen() {},
    setOrder() {},
    enablePrice: false,
    setEnablePrice() {},
    reason: '',
    setReason() {},
    ...orderContextValueOverride
  };

  return render(
    <MemoryRouter>
      <ChakraProvider>
        <OrderContext.Provider value={orderContextValue}>
          <MarketplaceSummary />
        </OrderContext.Provider>
      </ChakraProvider>
    </MemoryRouter>
  );
};

describe('MarketplaceSummary', () => {
  test('renders provider full name when provider has no title', () => {
    renderMarketplaceSummary();

    expect(screen.getByText(/Jane Provider sent/)).toBeInTheDocument();
  });

  test('renders provider full name when provider also has a title', () => {
    const order = generateOrder({
      patient: generatePatient({ name: { full: 'John Doe', first: 'John' } }),
      fills: [
        {
          ...generateFill('Metformin'),
          prescription: {
            ...generateFill('Metformin').prescription!,
            provider: {
              id: 'prv_test_default',
              name: {
                full: 'Jane Provider',
                last: 'Smith',
                title: 'Dr.'
              }
            }
          }
        }
      ]
    });

    renderMarketplaceSummary({ order });

    expect(screen.getByText(/Jane Provider sent/)).toBeInTheDocument();
  });
});
