import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { OfferCard } from './OfferCard';
import { OfferBundleDetails } from '../../utils/models';

vi.mock('./OfferInfo', () => ({
  OfferInfo: () => <div data-testid="offer-info" />
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
        isCurrentPharmacy={false}
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
        isCurrentPharmacy={false}
        selected={false}
        isPreferred={false}
        handleSelect={vi.fn()}
      />
    );

    expect(screen.queryByTestId('pharmacy-sent-here-badge')).not.toBeInTheDocument();
  });
});
