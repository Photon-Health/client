import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { generateOrder } from '../../test-utils/generators';
import { BrandedOptions } from './BrandedOptions';

const mockTrack = vi.fn();
const inViewHandlers: ((inView: boolean) => void)[] = [];

vi.mock('react-intersection-observer', () => ({
  useInView: (options: { onChange: (inView: boolean) => void }) => {
    inViewHandlers.push(options.onChange);
    return { ref: vi.fn() };
  }
}));

vi.mock('../../hooks/usePatientAnalytics', () => ({
  usePatientAnalytics: () => ({ track: mockTrack })
}));

const mockOrder = generateOrder({ id: 'ord_branded_test' });

vi.mock('../../views/Main', () => ({
  useOrderContext: () => ({ order: mockOrder })
}));

vi.mock('../../api', () => ({}));

vi.mock('./BrandedPharmacyCard', () => ({
  BrandedPharmacyCard: () => <div />
}));

const ALTO_ID = 'phr_alto_test';
const COST_PLUS_ID = 'phr_cost_plus_test';

describe('BrandedOptions', () => {
  beforeEach(() => {
    mockTrack.mockClear();
    inViewHandlers.length = 0;
    vi.stubEnv('VITE_ALTO_PHARMACY_ID', ALTO_ID);
    vi.stubEnv('VITE_COST_PLUS_PHARMACY_ID', COST_PLUS_ID);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('tracks each branded card impression with its own pharmacy name', () => {
    render(
      <BrandedOptions
        options={[ALTO_ID, COST_PLUS_ID]}
        location="Brooklyn, NY"
        selectedId={ALTO_ID}
        handleSelect={vi.fn()}
        shouldTrackOfferImpressionsAndSelections
      />
    );
    inViewHandlers.forEach((onChange) => onChange(true));

    const impressions = mockTrack.mock.calls
      .filter(([event]) => event === 'Offer Impression')
      .map(([, , properties]) => [properties?.pharmacyId, properties?.pharmacyName]);

    expect(impressions).toEqual([
      [ALTO_ID, 'Alto Pharmacy'],
      [COST_PLUS_ID, 'Cost Plus Pharmacy']
    ]);
  });
});
