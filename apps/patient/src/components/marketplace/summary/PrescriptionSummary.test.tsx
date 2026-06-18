import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { PrescriptionSummary } from './PrescriptionSummary';
import type { OrderContextType } from '../../../views/Main';
import { generateFlattenedFill, generateOrder } from '../../../test-utils/generators';

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

const renderPrescriptionSummary = (flattenedFills: OrderContextType['flattenedFills']) => {
  const orderContextValue: OrderContextType = {
    fetchOrder() {
      return Promise.resolve(undefined);
    },
    flattenedFills,
    isDemo: false,
    logo: undefined,
    order: generateOrder(),
    setFaqModalIsOpen() {},
    setOrder() {},
    enablePrice: false,
    setEnablePrice() {},
    reason: '',
    setReason() {}
  };

  return render(
    <MemoryRouter>
      <ChakraProvider>
        <OrderContext.Provider value={orderContextValue}>
          <PrescriptionSummary />
        </OrderContext.Provider>
      </ChakraProvider>
    </MemoryRouter>
  );
};

describe('PrescriptionSummary', () => {
  test('renders single prescription treatment name', () => {
    renderPrescriptionSummary([
      generateFlattenedFill({ treatment: { id: 'med_1', name: 'Metformin 500mg' } })
    ]);

    expect(screen.getByText('Metformin 500mg')).toBeInTheDocument();
    expect(screen.getByText(/your/)).toBeInTheDocument();
  });

  test('toggles expanded state when multi-rx button is clicked', async () => {
    renderPrescriptionSummary([
      generateFlattenedFill({ id: 'fill_1', treatment: { id: 'med_1', name: 'Metformin 500mg' } }),
      generateFlattenedFill({ id: 'fill_2', treatment: { id: 'med_2', name: 'Lisinopril 10mg' } })
    ]);

    const toggleButton = screen.getByRole('button', { name: '2 prescriptions' });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggleButton);

    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
  });
});
