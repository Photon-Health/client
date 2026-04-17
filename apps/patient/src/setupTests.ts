import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { PatientAnalytics } from './configs/analytics';
import { FEATURE_FLAG_DEFAULTS, FlagKeys, FlagValues } from './configs/featureFlags';

vi.mock('react-ga4', () => ({
  event: vi.fn()
}));

const getFlagValueImpl = async <K extends FlagKeys>(flagName: K, fallback?: FlagValues[K]) =>
  fallback ?? FEATURE_FLAG_DEFAULTS[flagName];

const getFlagValueSyncImpl = <K extends FlagKeys>(flagName: K, fallback?: FlagValues[K]) =>
  fallback ?? FEATURE_FLAG_DEFAULTS[flagName];

const mockPatientAnalytics: PatientAnalytics = {
  page: vi.fn(),
  identify: vi.fn(),
  track: vi.fn(),
  getFlagValue: vi.fn(getFlagValueImpl) as PatientAnalytics['getFlagValue'],
  getFlagValueSync: vi.fn(getFlagValueSyncImpl) as PatientAnalytics['getFlagValueSync']
};
vi.mock('./configs/analytics', () => ({
  getPatientAnalytics: () => mockPatientAnalytics
}));

vi.mock('@client/settings', () => ({
  getOrgMailOrderPharms: vi.fn(() => ({ patient: [] }))
}));

if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
  class IntersectionObserver {
    constructor() {}
    observe() {
      return null;
    }
    unobserve() {
      return null;
    }
    disconnect() {
      return null;
    }
    takeRecords() {
      return [];
    }
  }
  // @ts-ignore
  window.IntersectionObserver = IntersectionObserver;
  // @ts-ignore

  global.IntersectionObserver = IntersectionObserver;
}

vi.stubGlobal('scrollTo', vi.fn());

// Fixes bug in Chakra UI https://github.com/chakra-ui/chakra-ui/issues/6036
// useBreakpointValue causes bug during unit tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});
