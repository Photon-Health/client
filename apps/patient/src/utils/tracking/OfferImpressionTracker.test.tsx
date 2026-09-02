import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { generateOrder, generatePharmacy } from '../../test-utils/generators';

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

vi.mock('../offerAnalytics', () => ({
  getOfferType: () => 'None',
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
    offer: undefined,
    pharmacy: generatePharmacy({ id: 'phr_test', name: 'Test Pharmacy' }),
    ordinalPosition: 2,
    isAlreadySelected: false,
    enabled: true,
    children: <div>child</div>
  };

  test('tracks Offer Impression when element enters view and tracking is enabled', () => {
    render(<OfferImpressionTracker {...defaultProps} />);
    triggerInView?.(true);

    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith(
      'Offer Impression',
      mockOrder,
      expect.objectContaining({
        pharmacy_id: 'phr_test',
        pharmacy_name: 'Test Pharmacy',
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
