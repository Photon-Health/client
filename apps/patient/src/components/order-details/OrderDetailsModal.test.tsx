import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import theme from '../../configs/theme';
import { OrderDetailsModal, OrderDetailsProps } from './OrderDetailsModal';

const AMAZON_PHARMACY_ID = vi.hoisted(() => {
  const id = 'phr_01GA9HPV5XYTC1NNX213VRRBZ3';
  import.meta.env.VITE_AMAZON_PHARMACY_ID = id;
  return id;
});

const renderAmazonOrderDetails = (fulfillmentState: OrderDetailsProps['fulfillmentState']) =>
  render(
    <ChakraProvider theme={theme}>
      <OrderDetailsModal
        isOpen
        onClose={vi.fn()}
        pharmacyName="Amazon Pharmacy"
        pharmacyId={AMAZON_PHARMACY_ID}
        prescriptions={[{ rxName: 'Amoxicillin 500mg', quantity: '30 capsules', numRefills: 0 }]}
        fulfillmentState={fulfillmentState}
      />
    </ChakraProvider>
  );

describe('OrderDetailsModal', () => {
  test('shows Amazon Pharmacy next steps when the order is sent', async () => {
    renderAmazonOrderDetails('SENT');

    expect(await screen.findByText('Next Steps')).toBeInTheDocument();
    expect(screen.getByText(/Open the Amazon app and tap Pharmacy\. Or visit/)).toBeInTheDocument();
    expect(
      screen.getByText(/Sign in or sign up if you're new\. Make sure your SMS notifications/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Amazon Pharmacy will text you when your prescription is ready\./)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'amazon.com/pharmacy' })).toHaveAttribute(
      'href',
      'https://amazon.com/pharmacy'
    );
  });

  test('hides next steps once the order is ready', async () => {
    renderAmazonOrderDetails('READY');

    expect(await screen.findByText('Order Details')).toBeInTheDocument();
    expect(screen.queryByText('Next Steps')).not.toBeInTheDocument();
  });
});
