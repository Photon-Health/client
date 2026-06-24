import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { OfferCard } from './OfferCard';
import { OfferBundleDetails } from '../../utils/models';

vi.mock('./OfferInfo', () => ({
  OfferInfo: ({ isCurrentPharmacy }: { isCurrentPharmacy?: boolean }) => (
    <div data-testid="offer-info">
      {isCurrentPharmacy ? (
        <span data-testid="pharmacy-info-current-pharmacy">Current Pharmacy</span>
      ) : null}
    </div>
  )
}));

describe('OfferCard', () => {
  const baseOffer: OfferBundleDetails = {
    pharmacy: {
      id: 'amazon-pharmacy',
      name: 'Amazon Pharmacy',
      fulfillmentTypes: ['MAIL_ORDER']
    },
    deliveryEstimate: 'Delivers in 2-3 days',
    costType: 'INSURANCE_ESTIMATE',
    tags: [],
    medications: []
  };

  test('OfferCard renders sent here badge when pharmacy is fulfilling current order', () => {
    render(
      <OfferCard
        offer={baseOffer}
        isAutoroutedPharmacy={true}
        isPharmacyFulfillingCurrentOrder={false}
        selected={false}
        isPreferred={false}
        handleSelect={vi.fn()}
      />
    );

    expect(screen.getByTestId('pharmacy-sent-here-badge')).toBeInTheDocument();
  });

  test('OfferCard does not render sent here badge for selectable pharmacies', () => {
    render(
      <OfferCard
        offer={baseOffer}
        isAutoroutedPharmacy={false}
        isPharmacyFulfillingCurrentOrder={false}
        selected={false}
        isPreferred={false}
        handleSelect={vi.fn()}
      />
    );

    expect(screen.queryByTestId('pharmacy-sent-here-badge')).not.toBeInTheDocument();
  });

  test('OfferCard shows current pharmacy tag when pharmacy is current regardless of selected', () => {
    render(
      <OfferCard
        offer={baseOffer}
        isAutoroutedPharmacy={false}
        isPharmacyFulfillingCurrentOrder={true}
        selected={false}
        isPreferred={false}
        handleSelect={vi.fn()}
      />
    );

    expect(screen.getByTestId('pharmacy-info-current-pharmacy')).toBeInTheDocument();
  });
});
