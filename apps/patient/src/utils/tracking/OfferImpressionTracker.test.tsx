import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { generateOrder, generatePharmacy } from '../../test-utils/generators';
import { PharmacyOffer } from '../models';

const mockTrack = vi.fn();
let triggerInView: ((inView: boolean) => void) | undefined;

vi.mock('react-intersection-observer', () => ({
  useInView: (options: { onChange: (inView: boolean) => void }) => {
    triggerInView = options.onChange;
    return { ref: vi.fn() };
  }
}));

vi.mock('../../hooks/usePatientAnalytics', () => ({
  usePatientAnalytics: () => ({ track: mockTrack })
}));

const mockOrder = generateOrder({ id: 'ord_impression_test' });

vi.mock('../../views/Main', () => ({
  useOrderContext: () => ({ order: mockOrder })
}));

// the real one reads offer.source, and impressions dedupe on it
vi.mock('../offerAnalytics', () => ({
  getOfferType: ({ offer }: { offer?: { source?: string } }) => offer?.source ?? 'None',
  deriveCostType: () => undefined
}));

describe('OfferImpressionTracker', () => {
  let OfferImpressionTracker: typeof import('./OfferImpressionTracker').OfferImpressionTracker;

  beforeEach(async () => {
    vi.resetModules();
    mockTrack.mockClear();
    triggerInView = undefined;
    const module = await import('./OfferImpressionTracker');
    OfferImpressionTracker = module.OfferImpressionTracker;
  });

  const defaultProps = {
    pharmacy: generatePharmacy({ id: 'phr_test', name: 'Test Pharmacy' }),
    ordinalPosition: 2,
    isAlreadySelected: false,
    enabled: true,
    children: <div>child</div>
  };

  const offer = (source: string, costAmount?: number): PharmacyOffer => ({
    source,
    pharmacy: { id: 'phr_test', name: 'Test Pharmacy', fulfillmentTypes: ['PICK_UP'] },
    tags: [],
    pricing: costAmount == null ? {} : { costAmount, costAmountTitle: source },
    prescriptions: []
  });

  const trackedOfferTypes = () =>
    mockTrack.mock.calls.map(([, , properties]) => properties?.offerType);

  test('tracks Offer Impression when element enters view and tracking is enabled', () => {
    render(<OfferImpressionTracker {...defaultProps} />);
    triggerInView?.(true);

    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith(
      'Offer Impression',
      mockOrder,
      expect.objectContaining({
        pharmacyId: 'phr_test',
        pharmacyName: 'Test Pharmacy',
        pharmacyFulfillmentType: 'None',
        ordinal_position: 2,
        isAlreadySelected: false
      })
    );
  });

  test('tracks pharmacyFulfillmentType from pharmacy fulfillmentTypes', () => {
    render(
      <OfferImpressionTracker
        {...defaultProps}
        pharmacy={generatePharmacy({
          id: 'phr_mail',
          name: 'Mail Pharmacy',
          fulfillmentTypes: ['MAIL_ORDER']
        })}
      />
    );
    triggerInView?.(true);

    expect(mockTrack).toHaveBeenCalledWith(
      'Offer Impression',
      mockOrder,
      expect.objectContaining({
        pharmacyFulfillmentType: 'MAIL_ORDER'
      })
    );
  });

  test('does not track Offer Impression when tracking is disabled', () => {
    render(<OfferImpressionTracker {...defaultProps} enabled={false} />);
    triggerInView?.(true);

    expect(mockTrack).not.toHaveBeenCalled();
  });

  test('does not track Offer Impression when element is not in view', () => {
    render(<OfferImpressionTracker {...defaultProps} />);
    triggerInView?.(false);

    expect(mockTrack).not.toHaveBeenCalled();
  });

  test('does not track duplicate Offer Impression for same order and pharmacy after remount', () => {
    const { unmount } = render(<OfferImpressionTracker {...defaultProps} />);
    triggerInView?.(true);
    expect(mockTrack).toHaveBeenCalledTimes(1);

    unmount();
    render(<OfferImpressionTracker {...defaultProps} />);
    triggerInView?.(true);

    expect(mockTrack).toHaveBeenCalledTimes(1);
  });

  test('tracks an impression per offer on the card', () => {
    render(
      <OfferImpressionTracker
        {...defaultProps}
        offerGroup={{
          pharmacy: offer('ARRIVE').pharmacy,
          offers: [offer('UK_HEALTH', 30), offer('ARRIVE', 12)]
        }}
      />
    );
    triggerInView?.(true);

    expect(trackedOfferTypes()).toEqual(['UK_HEALTH', 'ARRIVE']);
  });

  test('tracks an offer that has no price', () => {
    render(
      <OfferImpressionTracker
        {...defaultProps}
        offerGroup={{ pharmacy: offer('UK_HEALTH').pharmacy, offers: [offer('UK_HEALTH')] }}
      />
    );
    triggerInView?.(true);

    expect(trackedOfferTypes()).toEqual(['UK_HEALTH']);
    expect(mockTrack).toHaveBeenCalledWith(
      'Offer Impression',
      mockOrder,
      expect.objectContaining({ offerShown: false })
    );
  });

  test('tracks a coupon price alongside an offer as its own impression', () => {
    render(
      <OfferImpressionTracker
        {...defaultProps}
        pharmacy={generatePharmacy({ id: 'phr_test', name: 'Test Pharmacy', price: 16.25 })}
        offerGroup={{ pharmacy: offer('ARRIVE').pharmacy, offers: [offer('ARRIVE', 12)] }}
        showPrice
      />
    );
    triggerInView?.(true);

    expect(trackedOfferTypes()).toEqual(['ARRIVE', 'None']);
  });

  test('does not track a coupon impression when the card hides the price', () => {
    render(
      <OfferImpressionTracker
        {...defaultProps}
        pharmacy={generatePharmacy({ id: 'phr_test', name: 'Test Pharmacy', price: 16.25 })}
        offerGroup={{ pharmacy: offer('ARRIVE').pharmacy, offers: [offer('ARRIVE', 12)] }}
        showPrice={false}
      />
    );
    triggerInView?.(true);

    expect(trackedOfferTypes()).toEqual(['ARRIVE']);
  });

  test('tracks Offer Impression separately for different pharmacies in same order', () => {
    const { unmount } = render(<OfferImpressionTracker {...defaultProps} />);
    triggerInView?.(true);

    unmount();
    render(
      <OfferImpressionTracker
        {...defaultProps}
        pharmacy={generatePharmacy({ id: 'phr_other', name: 'Other Pharmacy' })}
      />
    );
    triggerInView?.(true);

    expect(mockTrack).toHaveBeenCalledTimes(2);
  });
});
