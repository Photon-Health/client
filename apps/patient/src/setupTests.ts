import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { PatientAnalytics } from './configs/analytics';

vi.mock('react-ga4', () => ({
  event: vi.fn()
}));

vi.mock('@datadog/browser-rum', () => ({
  datadogRum: {
    addAction: vi.fn()
  }
}));
const mockPatientAnalytics: PatientAnalytics = {
  page: vi.fn(),
  identify: vi.fn(),
  track: vi.fn(),
  getFlagValue: vi.fn(),
  getFlagValueSync: vi.fn()
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
  // eslint-disable-next-line no-undef
  global.IntersectionObserver = IntersectionObserver;
}

vi.stubGlobal('scrollTo', vi.fn());
