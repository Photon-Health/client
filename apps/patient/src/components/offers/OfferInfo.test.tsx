import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { OfferInfo } from './OfferInfo';
import { OfferBundleDetails } from '../../utils/models';

// Mock the text utility
vi.mock('../../utils/text', () => ({
  text: {
    preferred: 'Preferred'
  }
}));

describe('OfferInfo', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const baseOffer: OfferBundleDetails = {
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
    tags: ['In Stock', 'Free Shipping'],
    medications: [{ name: 'Metformin 500mg', amount: 25.99, retailAmount: 150.0 }]
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

  test('shows retail price with strikethrough when greater than cost', () => {
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

  test('does not show retail price when same as or less than cost amount', () => {
    const offerWithSameCost = { ...baseOffer, costAmount: 150.0, retailAmount: 150.0 };
    const offerWithLowerRetail = { ...baseOffer, costAmount: 150.0, retailAmount: 100.0 };

    const { unmount } = render(
      <OfferInfo
        pharmacy={baseOffer.pharmacy}
        offer={offerWithSameCost}
        isCurrentPharmacy={false}
        isPreferred={false}
      />
    );
    expect(screen.getByText('$150')).toBeInTheDocument();
    expect(screen.queryByText('Retail')).not.toBeInTheDocument();

    unmount();

    render(
      <OfferInfo
        pharmacy={baseOffer.pharmacy}
        offer={offerWithLowerRetail}
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

  test('shows Sponsored text when pharmacy is Amazon', () => {
    const amazonPharmacyId = 'amazon-pharmacy-id';
    vi.stubEnv('VITE_AMAZON_PHARMACY_ID', amazonPharmacyId);

    const amazonPharmacy = { ...baseOffer.pharmacy, id: amazonPharmacyId };

    render(
      <OfferInfo
        pharmacy={amazonPharmacy}
        offer={{ ...baseOffer, pharmacy: amazonPharmacy }}
        isCurrentPharmacy={false}
        isPreferred={false}
      />
    );

    expect(screen.getByText('Sponsored')).toBeInTheDocument();
  });

  describe('OfferInfo — medication breakdown list', () => {
    const baseBundle: OfferBundleDetails = {
      pharmacy: {
        id: 'test-pharmacy-id',
        name: 'Test Pharmacy',
        fulfillmentTypes: ['MAIL_ORDER'],
        logo: undefined
      },
      deliveryEstimate: 'Delivers in 2-3 days',
      costType: 'PRIME_RX',
      costAmount: 45.0,
      costAmountTitle: 'Prime Rx Price',
      retailAmount: 200.0,
      retailAmountTitle: 'Retail',
      tags: [],
      medications: [
        { name: 'Metformin 500mg', amount: 20.0, retailAmount: 100.0 },
        { name: 'Lisinopril 10mg', amount: 25.0, retailAmount: 100.0 }
      ]
    };

    test('does not render the breakdown list when medications array is empty', () => {
      const emptyMedsBundle: OfferBundleDetails = { ...baseBundle, medications: [] };

      render(
        <OfferInfo
          pharmacy={emptyMedsBundle.pharmacy}
          offer={emptyMedsBundle}
          isCurrentPharmacy={false}
          isPreferred={false}
        />
      );

      expect(screen.queryByText('Metformin 500mg')).not.toBeInTheDocument();
      expect(screen.queryByText('Lisinopril 10mg')).not.toBeInTheDocument();
    });

    test('does not render the breakdown list for single-med', () => {
      const singleMedBundle: OfferBundleDetails = {
        ...baseBundle,
        medications: [{ name: 'Metformin 500mg', amount: 20.0, retailAmount: 100.0 }]
      };

      render(
        <OfferInfo
          pharmacy={singleMedBundle.pharmacy}
          offer={singleMedBundle}
          isCurrentPharmacy={false}
          isPreferred={false}
        />
      );

      expect(screen.queryByText('Metformin 500mg')).not.toBeInTheDocument();
    });

    test('renders each medication and retail strikethrough only when retail is greater than cost for multi-med', () => {
      const bundle: OfferBundleDetails = {
        ...baseBundle,
        medications: [
          { name: 'Metformin 500mg', amount: 20.0, retailAmount: 100.0 }, // retail > cost
          { name: 'Lisinopril 10mg', amount: 25.0, retailAmount: 25.0 }, // retail === cost
          { name: 'Atorvastatin 10mg', amount: 30.0, retailAmount: 10.0 } // retail < cost
        ]
      };

      render(
        <OfferInfo
          pharmacy={bundle.pharmacy}
          offer={bundle}
          isCurrentPharmacy={false}
          isPreferred={false}
        />
      );

      const retailPrices = screen.getAllByText('$100');
      expect(retailPrices).toHaveLength(1);
      expect(retailPrices[0]).toHaveStyle('text-decoration: line-through');

      // $25 appears as Lisinopril's cost price — no strikethrough retail alongside it
      const lisinoprilPrice = screen.getByText('$25');
      expect(lisinoprilPrice).not.toHaveStyle('text-decoration: line-through');

      // $10 should not appear at all (Atorvastatin's retail is lower than cost)
      expect(screen.queryByText('$10')).not.toBeInTheDocument();
    });
  });

  describe('OfferInfo — coupon tag', () => {
    const baseSingleMedBundle: OfferBundleDetails = {
      pharmacy: {
        id: 'test-pharmacy-id',
        name: 'Amazon Pharmacy',
        fulfillmentTypes: ['MAIL_ORDER'],
        logo: undefined
      },
      deliveryEstimate: 'Delivers in 2-3 days',
      costType: 'PRIME_RX',
      costAmount: 25.0,
      costAmountTitle: 'Prime Rx Price',
      retailAmount: 100.0,
      retailAmountTitle: 'Retail',
      tags: [],
      medications: [{ name: 'Metformin 500mg', amount: 25.0, retailAmount: 100.0 }]
    };

    test('does not render coupon tag when single-med has no promotions', () => {
      render(
        <OfferInfo
          pharmacy={baseSingleMedBundle.pharmacy}
          offer={baseSingleMedBundle}
          isCurrentPharmacy={false}
          isPreferred={false}
        />
      );

      expect(screen.queryByText(/coupon/i)).not.toBeInTheDocument();
    });

    test('renders coupon tag with savings amount when single-med has promotion', () => {
      const offerWithCoupon: OfferBundleDetails = {
        ...baseSingleMedBundle,
        medications: [
          {
            ...baseSingleMedBundle.medications[0],
            promotions: [{ type: 'PHARMACY_RX_COUPON', amountSaved: 15 }]
          }
        ]
      };

      render(
        <OfferInfo
          pharmacy={offerWithCoupon.pharmacy}
          offer={offerWithCoupon}
          isCurrentPharmacy={false}
          isPreferred={false}
        />
      );

      expect(screen.getByText(/up to \$15/i)).toBeInTheDocument();
      expect(screen.getByText(/coupon if eligible/i)).toBeInTheDocument();
    });

    test('renders "with coupon if eligible" when single-med promotion has no amountSaved', () => {
      const offerWithZeroCoupon: OfferBundleDetails = {
        ...baseSingleMedBundle,
        medications: [
          {
            ...baseSingleMedBundle.medications[0],
            promotions: [{ type: 'PHARMACY_RX_COUPON', amountSaved: 0 }]
          }
        ]
      };

      render(
        <OfferInfo
          pharmacy={offerWithZeroCoupon.pharmacy}
          offer={offerWithZeroCoupon}
          isCurrentPharmacy={false}
          isPreferred={false}
        />
      );

      expect(screen.getByText(/with coupon if eligible/i)).toBeInTheDocument();
      expect(screen.queryByText(/up to \$/i)).not.toBeInTheDocument();
    });

    test('renders coupon tag per medication in multi-med breakdown', () => {
      const multiMedWithCoupons: OfferBundleDetails = {
        ...baseSingleMedBundle,
        medications: [
          {
            name: 'Metformin 500mg',
            amount: 20.0,
            promotions: [{ type: 'PHARMACY_RX_COUPON', amountSaved: 10 }]
          },
          {
            name: 'Lisinopril 10mg',
            amount: 25.0,
            promotions: [{ type: 'PHARMACY_RX_COUPON', amountSaved: 5 }]
          }
        ]
      };

      render(
        <OfferInfo
          pharmacy={multiMedWithCoupons.pharmacy}
          offer={multiMedWithCoupons}
          isCurrentPharmacy={false}
          isPreferred={false}
        />
      );

      expect(screen.getByText(/up to \$10/i)).toBeInTheDocument();
      expect(screen.getByText(/up to \$5/i)).toBeInTheDocument();
    });

    test('does not render coupon tag for multi-med medication with no promotion', () => {
      const multiMedPartialCoupons: OfferBundleDetails = {
        ...baseSingleMedBundle,
        medications: [
          {
            name: 'Metformin 500mg',
            amount: 20.0,
            promotions: [{ type: 'PHARMACY_RX_COUPON', amountSaved: 10 }]
          },
          { name: 'Lisinopril 10mg', amount: 25.0 }
        ]
      };

      render(
        <OfferInfo
          pharmacy={multiMedPartialCoupons.pharmacy}
          offer={multiMedPartialCoupons}
          isCurrentPharmacy={false}
          isPreferred={false}
        />
      );

      expect(screen.getByText(/up to \$10/i)).toBeInTheDocument();
      expect(screen.getAllByText(/coupon if eligible/i)).toHaveLength(1);
    });
  });
});
