import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { OfferInfo } from './OfferInfo';
import { Offer } from '../pharmacy-card-list';

// Mock the text utility
vi.mock('../../utils/text', () => ({
  text: {
    preferred: 'Preferred'
  }
}));

describe('OfferInfo', () => {
  const baseOffer: Offer = {
    pharmacy: {
      id: 'test-pharmacy-id',
      name: 'Test Pharmacy',
      fulfillmentTypes: ['MAIL_ORDER'],
      logo: 'https://example.com/logo.png'
    },
    deliveryEstimate: 'Delivers in 2-3 days',
    costType: 'INSURANCE_ESTIMATE',
    costAmount: 25.99,
    costAmountTitle: 'Insurance Price',
    retailAmount: 150.0,
    retailAmountTitle: 'Retail',
    tags: ['In Stock', 'Free Shipping']
  };

  test('renders pharmacy name and logo', () => {
    render(
      <OfferInfo
        pharmacy={baseOffer.pharmacy}
        offer={baseOffer}
        isCurrentPharmacy={false}
        isPreferred={false}
      />
    );

    expect(screen.getByText('Test Pharmacy')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  test('renders without logo when not provided', () => {
    const pharmacyWithoutLogo = { ...baseOffer.pharmacy, logo: undefined };

    render(
      <OfferInfo
        pharmacy={pharmacyWithoutLogo}
        offer={baseOffer}
        isCurrentPharmacy={false}
        isPreferred={false}
      />
    );

    expect(screen.getByText('Test Pharmacy')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  test('renders cost information when available', () => {
    render(
      <OfferInfo
        pharmacy={baseOffer.pharmacy}
        offer={baseOffer}
        isCurrentPharmacy={false}
        isPreferred={false}
      />
    );

    expect(screen.getByText('Insurance Price')).toBeInTheDocument();
    expect(screen.getByText('$25.99')).toBeInTheDocument();
    expect(screen.getByText('Retail')).toBeInTheDocument();
    expect(screen.getByText('$150')).toBeInTheDocument();
  });

  test('shows retail price with strikethrough when different from cost', () => {
    render(
      <OfferInfo
        pharmacy={baseOffer.pharmacy}
        offer={baseOffer}
        isCurrentPharmacy={false}
        isPreferred={false}
      />
    );

    const retailPriceElement = screen.getByText('$150');
    expect(retailPriceElement).toBeInTheDocument();
    expect(retailPriceElement).toHaveStyle('text-decoration: line-through');
  });

  test('does not show retail price when same as cost amount', () => {
    const offerWithSameCost = {
      ...baseOffer,
      costAmount: 150.0,
      retailAmount: 150.0
    };

    render(
      <OfferInfo
        pharmacy={baseOffer.pharmacy}
        offer={offerWithSameCost}
        isCurrentPharmacy={false}
        isPreferred={false}
      />
    );

    expect(screen.getByText('$150')).toBeInTheDocument();
    expect(screen.queryByText('Retail')).not.toBeInTheDocument();
  });

  test('renders delivery estimate', () => {
    render(
      <OfferInfo
        pharmacy={baseOffer.pharmacy}
        offer={baseOffer}
        isCurrentPharmacy={false}
        isPreferred={false}
      />
    );

    expect(screen.getByText('Delivers in 2-3 days')).toBeInTheDocument();
  });

  test('renders offer tags', () => {
    render(
      <OfferInfo
        pharmacy={baseOffer.pharmacy}
        offer={baseOffer}
        isCurrentPharmacy={false}
        isPreferred={false}
      />
    );

    expect(screen.getByText('In Stock')).toBeInTheDocument();
    expect(screen.getByText('Free Shipping')).toBeInTheDocument();
  });

  test('shows preferred tag when isPreferred is true', () => {
    render(
      <OfferInfo
        pharmacy={baseOffer.pharmacy}
        offer={baseOffer}
        isCurrentPharmacy={false}
        isPreferred={true}
      />
    );

    expect(screen.getByText('Preferred')).toBeInTheDocument();
  });

  test('shows current pharmacy tag when isCurrentPharmacy is true', () => {
    render(
      <OfferInfo
        pharmacy={baseOffer.pharmacy}
        offer={baseOffer}
        isCurrentPharmacy={true}
        isPreferred={false}
      />
    );

    expect(screen.getByText('Current Pharmacy')).toBeInTheDocument();
  });

  test('handles missing cost information gracefully', () => {
    const offerWithoutCost = {
      ...baseOffer,
      costAmount: undefined,
      costAmountTitle: undefined,
      retailAmount: undefined,
      retailAmountTitle: undefined
    };

    render(
      <OfferInfo
        pharmacy={baseOffer.pharmacy}
        offer={offerWithoutCost}
        isCurrentPharmacy={false}
        isPreferred={false}
      />
    );

    expect(screen.getByText('Test Pharmacy')).toBeInTheDocument();
    expect(screen.getByText('Delivers in 2-3 days')).toBeInTheDocument();
    expect(screen.queryByText('$')).not.toBeInTheDocument();
  });

  test('uses retail amount as cost when cost amount is not provided', () => {
    const offerWithOnlyRetail = {
      ...baseOffer,
      costAmount: undefined,
      costAmountTitle: undefined,
      retailAmount: 100.0,
      retailAmountTitle: 'Retail Price'
    };

    render(
      <OfferInfo
        pharmacy={baseOffer.pharmacy}
        offer={offerWithOnlyRetail}
        isCurrentPharmacy={false}
        isPreferred={false}
      />
    );

    expect(screen.getByText('Retail Price')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    // Should not show retail price strikethrough since it's the same as cost
    expect(screen.queryByText('Retail')).not.toBeInTheDocument();
  });

  test('renders without pharmacy when pharmacy is null', () => {
    const { container } = render(
      <OfferInfo
        pharmacy={null as any}
        offer={baseOffer}
        isCurrentPharmacy={false}
        isPreferred={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('renders without pharmacy when pharmacy is undefined', () => {
    const { container } = render(
      <OfferInfo
        pharmacy={undefined}
        offer={baseOffer}
        isCurrentPharmacy={false}
        isPreferred={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('handles empty tags array', () => {
    const offerWithoutTags = {
      ...baseOffer,
      tags: []
    };

    render(
      <OfferInfo
        pharmacy={baseOffer.pharmacy}
        offer={offerWithoutTags}
        isCurrentPharmacy={false}
        isPreferred={false}
      />
    );

    expect(screen.getByText('Test Pharmacy')).toBeInTheDocument();
    expect(screen.queryByText('In Stock')).not.toBeInTheDocument();
    expect(screen.queryByText('Free Shipping')).not.toBeInTheDocument();
  });

  test('combines preferred and current pharmacy tags with offer tags', () => {
    render(
      <OfferInfo
        pharmacy={baseOffer.pharmacy}
        offer={baseOffer}
        isCurrentPharmacy={true}
        isPreferred={true}
      />
    );

    expect(screen.getByText('Preferred')).toBeInTheDocument();
    expect(screen.getByText('Current Pharmacy')).toBeInTheDocument();
    expect(screen.getByText('In Stock')).toBeInTheDocument();
    expect(screen.getByText('Free Shipping')).toBeInTheDocument();
  });
});
