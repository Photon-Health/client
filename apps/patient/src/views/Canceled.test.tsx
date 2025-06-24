import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { Helmet } from 'react-helmet';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Canceled } from './Canceled';
import { useOrderContext } from './Main';

vi.mock('./Main', () => ({
  useOrderContext: vi.fn()
}));

vi.mock('../components', () => ({
  PrescriptionsList: () => <div data-testid="prescriptions-list">Prescriptions List</div>
}));

const mockUseOrderContext = vi.mocked(useOrderContext);

const mockOrder = {
  patient: {
    name: {
      full: 'John Doe'
    }
  }
};

const renderCanceled = () => {
  return render(
    <ChakraProvider>
      <Canceled />
    </ChakraProvider>
  );
};

describe('Canceled', () => {
  beforeEach(() => {
    mockUseOrderContext.mockReturnValue({
      order: mockOrder
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the canceled order heading', () => {
    renderCanceled();
    expect(screen.getByRole('heading', { name: /order canceled/i })).toBeInTheDocument();
  });

  it('displays the patient name', () => {
    renderCanceled();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/patient/i)).toBeInTheDocument();
  });

  it('renders the prescriptions list component', () => {
    renderCanceled();
    expect(screen.getByTestId('prescriptions-list')).toBeInTheDocument();
  });

  it('displays reach out message', () => {
    renderCanceled();
    expect(screen.getByText(/reachout/i)).toBeInTheDocument();
  });

  it('sets the correct page title', () => {
    renderCanceled();
    const helmet = Helmet.peek();
    expect(helmet.title).toBe('Order Canceled');
  });
});