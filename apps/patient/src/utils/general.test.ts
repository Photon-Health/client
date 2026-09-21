import { afterEach, describe, expect, test, vi } from 'vitest';
import { derivePharmacyOpenState } from './general';

const openEvent = (datetime: string) => ({ type: 'open', datetime });
const closeEvent = (datetime: string) => ({ type: 'close', datetime });

describe('derivePharmacyOpenState', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('returns empty state when there are no next events', () => {
    expect(derivePharmacyOpenState(undefined, true)).toEqual({
      is24Hr: false,
      isClosingSoon: false,
      opens: '',
      closes: ''
    });
  });

  test('returns is24Hr when the open event is 24hr', () => {
    const state = derivePharmacyOpenState(
      { open: { type: '24hr' }, close: { type: '24hr' } },
      true
    );

    expect(state.is24Hr).toBe(true);
  });

  test('returns isClosingSoon true when closing within 30 minutes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-18T12:00:00Z'));

    const state = derivePharmacyOpenState(
      { open: openEvent('2026-09-19T13:00:00Z'), close: closeEvent('2026-09-18T12:10:00Z') },
      true
    );

    expect(state.isClosingSoon).toBe(true);
    expect(state.closes).toMatch(/Closes in \d+ mins/);
  });

  test('returns isClosingSoon false when closing beyond 30 minutes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-18T12:00:00Z'));

    const state = derivePharmacyOpenState(
      { open: openEvent('2026-09-19T13:00:00Z'), close: closeEvent('2026-09-18T18:00:00Z') },
      true
    );

    expect(state.isClosingSoon).toBe(false);
    expect(state.closes).toMatch(/^Closes /);
  });
});
