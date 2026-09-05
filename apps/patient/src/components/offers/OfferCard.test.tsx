import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { OfferCard } from './OfferCard';
import { OfferBundleComplete } from '../../utils/models';

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
  const baseOffer: OfferBundleComplete = {
    pharmacy: {
      id: 'amazon-pharmacy',
      name: 'Amazon Pharmacy',
      fulfillmentTypes: ['MAIL_ORDER']
    },
    deliveryEstimate: 'Delivers in 2-3 days',
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

  test('OfferCard does not call handleSelect when current pharmacy is not autorouted', () => {
    const handleSelect = vi.fn();

    const { container } = render(
      <OfferCard
        offer={baseOffer}
        isAutoroutedPharmacy={false}
        isPharmacyFulfillingCurrentOrder={true}
        selected={false}
        isPreferred={false}
        handleSelect={handleSelect}
      />
    );

    expect(container.firstChild).toHaveStyle({ pointerEvents: 'none' });
    expect(handleSelect).not.toHaveBeenCalled();
  });
});
