import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createContext } from 'react';
import { usePageAnalytics } from './usePageAnalytics';
import { getPatientAnalytics } from '../configs/analytics';

const mockPage = vi.fn();
const patientAnalytics = {
  page: (...args: unknown[]) => mockPage(...args),
  track: vi.fn()
};

vi.mock('../configs/analytics', () => ({
  getPatientAnalytics: () => patientAnalytics
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/test-path' })
}));

vi.mock('../views/Main', () => ({
  OrderContext: createContext({
    order: {
      id: 'ord_123',
      organization: {
        id: 'org_123',
        name: 'Test Org'
      }
    }
  })
}));

describe('usePageAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls patientAnalytics.page once on mount', () => {
    renderHook(() =>
      usePageAnalytics({
        pageName: 'Test Page',
        properties: { testProp: true }
      })
    );

    expect(mockPage).toHaveBeenCalledTimes(1);
    expect(mockPage).toHaveBeenCalledWith('/test-path', 'Test Page', {
      testProp: true,
      orderId: 'ord_123',
      organizationId: 'org_123',
      organizationName: 'Test Org'
    });
  });

  it('does not call patientAnalytics.page again when properties change', () => {
    const { rerender } = renderHook(
      ({ properties }) =>
        usePageAnalytics({
          pageName: 'Test Page',
          properties
        }),
      {
        initialProps: { properties: { testMutableProperty: true } }
      }
    );

    expect(mockPage).toHaveBeenCalledTimes(1);
    expect(mockPage).toHaveBeenCalledWith(
      '/test-path',
      'Test Page',
      expect.objectContaining({
        testMutableProperty: true
      })
    );

    rerender({ properties: { testMutableProperty: false } });

    expect(mockPage).toHaveBeenCalledTimes(1);
  });
});
