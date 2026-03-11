import '@testing-library/jest-dom';
import { vi } from 'vitest';
import './i18n';

vi.mock('react-ga4', () => ({
  event: vi.fn()
}));

vi.mock('@datadog/browser-rum', () => ({
  datadogRum: {
    addAction: vi.fn()
  }
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
