import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { DistanceAddress, Hours, PharmacyInfo } from './PharmacyInfo';
import { EnrichedPharmacy, PharmacyOffer } from '../utils/models';
import { groupOffersByPharmacy } from '../utils/offers';
import theme from '../configs/theme';

const hours: NonNullable<EnrichedPharmacy['hours']> = [
  {
    dayOfWeek: 'TUESDAY',
    is24Hr: false,
    openFrom: '09:00',
    openUntil: '17:00',
    timezone: 'America/New_York'
  },
  {
    dayOfWeek: 'MONDAY',
    is24Hr: false,
    openFrom: '08:00',
    openUntil: '16:00',
    timezone: 'America/New_York'
  }
];

describe('Hours', () => {
  test('renders nothing when isOpen is undefined', () => {
    render(<Hours hours={hours} />);

    expect(screen.queryByText('Closed')).not.toBeInTheDocument();
  });

  test('renders open state when isOpen is true', () => {
    render(<Hours isOpen closes="Closes 5 pm" />);

    expect(screen.getByText('Closes 5 pm')).toBeInTheDocument();
  });
});

describe('DistanceAddress', () => {
  const address = {
    street1: '1 Main St',
    city: 'Brooklyn',
    state: 'NY',
    postalCode: '11249',
    country: 'US'
  };

  test('renders nothing without an address', () => {
    render(<DistanceAddress distance={1.2} />);

    expect(screen.queryByText(/mi/)).not.toBeInTheDocument();
  });

  test('renders the address alone when distance is absent', () => {
    render(<DistanceAddress address={address} />);

    expect(screen.getByText(/1 Main St/)).toBeInTheDocument();
    expect(screen.queryByText(/mi/)).not.toBeInTheDocument();
  });
});

describe('PharmacyInfo', () => {
  const pharmacy = { id: 'phr_1', name: 'Walgreens', showReadyIn30Min: true } as EnrichedPharmacy;
  const offer = (overrides: Partial<PharmacyOffer>) =>
    ({ pharmacy: { id: 'phr_1' }, tags: [], pricing: {}, ...overrides } as PharmacyOffer);

  test('offer tags replace pharmacy tags', () => {
    const [offerGroup] = groupOffersByPharmacy([
      offer({ tags: [{ kind: 'IN_NETWORK', label: 'In network' }] })
    ]);
    render(
      <MemoryRouter>
        <PharmacyInfo pharmacy={pharmacy} offerGroup={offerGroup} />
      </MemoryRouter>
    );

    expect(screen.getByText('In network')).toBeInTheDocument();
    expect(screen.queryByText('Ready in 30 minutes')).not.toBeInTheDocument();
  });

  test('renders a BEST_IN_LEXINGTON offer tag green with a star', () => {
    const [offerGroup] = groupOffersByPharmacy([
      offer({ tags: [{ kind: 'BEST_IN_LEXINGTON', label: 'Voted best in Lexington' }] })
    ]);
    render(
      <ChakraProvider theme={theme()}>
        <MemoryRouter>
          <PharmacyInfo pharmacy={pharmacy} offerGroup={offerGroup} />
        </MemoryRouter>
      </ChakraProvider>
    );

    expect(screen.getByTestId('best-in-lexington-star')).toBeInTheDocument();
    expect(screen.getByText('Voted best in Lexington').parentElement).toHaveStyle({
      backgroundColor: 'var(--chakra-colors-green-100)',
      color: 'var(--chakra-colors-green-600)'
    });
  });

  test('renders other offer tag kinds blue without a star', () => {
    const [offerGroup] = groupOffersByPharmacy([
      offer({ tags: [{ kind: 'IN_NETWORK', label: 'In network' }] })
    ]);
    render(
      <ChakraProvider theme={theme()}>
        <MemoryRouter>
          <PharmacyInfo pharmacy={pharmacy} offerGroup={offerGroup} />
        </MemoryRouter>
      </ChakraProvider>
    );

    expect(screen.queryByTestId('best-in-lexington-star')).not.toBeInTheDocument();
    expect(screen.getByText('In network').parentElement).not.toHaveStyle({
      backgroundColor: 'var(--chakra-colors-green-100)'
    });
  });
});
