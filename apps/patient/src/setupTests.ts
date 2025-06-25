// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';

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
