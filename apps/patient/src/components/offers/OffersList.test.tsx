import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { OffersList } from './OffersList';
import { OfferBundleDetails } from '../../utils/models';

// Mock the OfferImpressionTracker component
vi.mock('../../utils/tracking/OfferImpressionTracker', () => ({
  OfferImpressionTracker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="offer-impression-tracker">{children}</div>
  )
}));

// Mock the OfferCard component
vi.mock('./OfferCard', () => ({
  OfferCard: ({
    offer,
    selected,
    isPreferred,
    isAutoroutedPharmacy,
    isPharmacyFulfillingCurrentOrder,
    handleSelect
  }: any) => (
    <div
      data-testid={`offer-card-${offer.pharmacy.id}`}
      data-selected={selected}
      data-preferred={isPreferred}
      data-autorouted-pharmacy={isAutoroutedPharmacy}
      data-fulfilling-current-order={isPharmacyFulfillingCurrentOrder}
      onClick={() => handleSelect(offer.pharmacy.id, offer)}
    >
      <div data-testid="pharmacy-info">
        <div data-testid="pharmacy-info-name">{offer.pharmacy.name}</div>
        <div>{offer.deliveryEstimate}</div>
        {offer.costAmount && <div>${offer.costAmount}</div>}
        {offer.tags?.map((tag: string) => (
          <span key={tag} data-testid={`tag-${tag}`}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}));

describe('OffersList', () => {
  const mockOffers: OfferBundleDetails[] = [
    {
      pharmacy: {
        id: 'amazon-pharmacy',
        name: 'Amazon Pharmacy',
        fulfillmentTypes: ['MAIL_ORDER']
      },
      deliveryEstimate: 'Delivers in 2-3 days',
      costType: 'INSURANCE_ESTIMATE',
      costAmount: 25.99,
      costAmountTitle: 'Insurance Price',
      retailAmount: 150.0,
      retailAmountTitle: 'Retail',
      tags: ['In Stock', 'Free Shipping'],
      medications: [{ name: 'Metformin 500mg', amount: 25.99, retailAmount: 150.0 }]
    },
    {
      pharmacy: {
        id: 'novocare-pharmacy',
        name: 'Novocare',
        fulfillmentTypes: ['MAIL_ORDER']
      },
      deliveryEstimate: 'Delivers in 3-5 days',
      costType: 'NOVOCARE_OFFER',
      tags: ['Special Offer'],
      medications: []
    }
  ];

  const defaultProps = {
    offers: mockOffers,
    shouldTrackOfferImpressionsAndSelections: true,
    selectedPharmacyId: '',
    preferredPharmacyId: '',
    handleSelect: vi.fn()
  };

  test('renders all offers', () => {
    render(<OffersList {...defaultProps} />);

    expect(screen.getByTestId('offer-card-amazon-pharmacy')).toBeInTheDocument();
    expect(screen.getByTestId('offer-card-novocare-pharmacy')).toBeInTheDocument();
  });

  test('renders offer information correctly', () => {
    render(<OffersList {...defaultProps} />);

    expect(screen.getByText('Amazon Pharmacy')).toBeInTheDocument();
    expect(screen.getByText('Delivers in 2-3 days')).toBeInTheDocument();
    expect(screen.getByText('$25.99')).toBeInTheDocument();
    expect(screen.getByText('Novocare')).toBeInTheDocument();
    expect(screen.getByText('Delivers in 3-5 days')).toBeInTheDocument();
  });

  test('renders offer tags', () => {
    render(<OffersList {...defaultProps} />);

    expect(screen.getByTestId('tag-In Stock')).toBeInTheDocument();
    expect(screen.getByTestId('tag-Free Shipping')).toBeInTheDocument();
    expect(screen.getByTestId('tag-Special Offer')).toBeInTheDocument();
  });

  test('shows selected state for selected pharmacy', () => {
    render(<OffersList {...defaultProps} selectedPharmacyId="amazon-pharmacy" />);

    const amazonCard = screen.getByTestId('offer-card-amazon-pharmacy');
    const novocareCard = screen.getByTestId('offer-card-novocare-pharmacy');

    expect(amazonCard).toHaveAttribute('data-selected', 'true');
    expect(novocareCard).toHaveAttribute('data-selected', 'false');
  });

  test('shows preferred state for preferred pharmacy', () => {
    render(<OffersList {...defaultProps} preferredPharmacyId="novocare-pharmacy" />);

    const amazonCard = screen.getByTestId('offer-card-amazon-pharmacy');
    const novocareCard = screen.getByTestId('offer-card-novocare-pharmacy');

    expect(amazonCard).toHaveAttribute('data-preferred', 'false');
    expect(novocareCard).toHaveAttribute('data-preferred', 'true');
  });

  test('marks offer card as fulfilling current order when pharmacy matches current pharmacy', () => {
    render(<OffersList {...defaultProps} currentPharmacyId="amazon-pharmacy" />);

    const amazonCard = screen.getByTestId('offer-card-amazon-pharmacy');
    const novocareCard = screen.getByTestId('offer-card-novocare-pharmacy');

    expect(amazonCard).toHaveAttribute('data-fulfilling-current-order', 'true');
    expect(novocareCard).toHaveAttribute('data-fulfilling-current-order', 'false');
  });

  test('marks offer card as autorouted when pharmacy matches autorouted pharmacy', () => {
    render(<OffersList {...defaultProps} autoroutedPharmacyId="amazon-pharmacy" />);

    const amazonCard = screen.getByTestId('offer-card-amazon-pharmacy');
    const novocareCard = screen.getByTestId('offer-card-novocare-pharmacy');

    expect(amazonCard).toHaveAttribute('data-autorouted-pharmacy', 'true');
    expect(novocareCard).toHaveAttribute('data-autorouted-pharmacy', 'false');
  });

  test('calls handleSelect when offer card is clicked', async () => {
    const handleSelect = vi.fn();
    render(<OffersList {...defaultProps} handleSelect={handleSelect} />);

    const amazonCard = screen.getByTestId('offer-card-amazon-pharmacy');
    await userEvent.click(amazonCard);

    expect(handleSelect).toHaveBeenCalledWith('amazon-pharmacy', mockOffers[0]);
  });

  test('renders with impression tracking when enabled', () => {
    render(<OffersList {...defaultProps} />);

    const impressionTrackers = screen.getAllByTestId('offer-impression-tracker');
    expect(impressionTrackers).toHaveLength(2);
  });

  test('renders without impression tracking when disabled', () => {
    render(<OffersList {...defaultProps} shouldTrackOfferImpressionsAndSelections={false} />);

    const impressionTrackers = screen.getAllByTestId('offer-impression-tracker');
    expect(impressionTrackers).toHaveLength(2); // Still renders but tracking is disabled
  });

  test('handles empty offers array', () => {
    render(<OffersList {...defaultProps} offers={[]} />);

    expect(screen.queryByTestId('offer-card-amazon-pharmacy')).not.toBeInTheDocument();
    expect(screen.queryByTestId('offer-card-novocare-pharmacy')).not.toBeInTheDocument();
  });

  test('passes correct props to OfferCard components', () => {
    const handleSelect = vi.fn();
    render(
      <OffersList
        {...defaultProps}
        selectedPharmacyId="amazon-pharmacy"
        preferredPharmacyId="novocare-pharmacy"
        handleSelect={handleSelect}
      />
    );

    const amazonCard = screen.getByTestId('offer-card-amazon-pharmacy');
    const novocareCard = screen.getByTestId('offer-card-novocare-pharmacy');

    // Check that the correct props are passed
    expect(amazonCard).toHaveAttribute('data-selected', 'true');
    expect(amazonCard).toHaveAttribute('data-preferred', 'false');
    expect(novocareCard).toHaveAttribute('data-selected', 'false');
    expect(novocareCard).toHaveAttribute('data-preferred', 'true');
  });

  test('renders offers in correct order', () => {
    render(<OffersList {...defaultProps} />);

    const offerCards = screen.getAllByTestId(/offer-card-/);
    expect(offerCards[0]).toHaveAttribute('data-testid', 'offer-card-amazon-pharmacy');
    expect(offerCards[1]).toHaveAttribute('data-testid', 'offer-card-novocare-pharmacy');
  });
});
