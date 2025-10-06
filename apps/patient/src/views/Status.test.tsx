import { vi } from 'vitest';

vi.mock('../api', () => ({
  triggerDemoNotification: vi.fn(),
  geocode: vi.fn().mockResolvedValue({
    lat: 0,
    lng: 0,
    address: 'mocked address'
  })
}));

import { computeNumRefillsForPrescription } from './Status';

describe('computeNumRefillsForPrescription', () => {
  it('returns correct refills for a single prescription (fills count - 1)', () => {
    const rxId = 'rx-1';
    const orderFills = [{ prescription: { id: rxId } }, { prescription: { id: rxId } }];
    // 2 fills for rx-1 => refills = 2 - 1 = 1
    expect(computeNumRefillsForPrescription(orderFills, rxId)).toBe(1);
  });

  it('handles multiple prescriptions and counts fills per prescription (minus one)', () => {
    const rx1 = 'rx-1';
    const rx2 = 'rx-2';
    const rx3 = 'rx-3';
    const orderFills = [
      { prescription: { id: rx1 } },
      { prescription: { id: rx1 } },
      { prescription: { id: rx2 } },
      { prescription: { id: rx2 } },
      { prescription: { id: rx2 } },
      { prescription: { id: rx3 } }
    ];

    // rx1: 2 fills -> 1 refill
    expect(computeNumRefillsForPrescription(orderFills, rx1)).toBe(1);
    // rx2: 3 fills -> 2 refills
    expect(computeNumRefillsForPrescription(orderFills, rx2)).toBe(2);
    // rx3: 1 fill -> 0 refills (floored at 0)
    expect(computeNumRefillsForPrescription(orderFills, rx3)).toBe(0);
  });
});
