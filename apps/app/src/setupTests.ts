import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { randomUUID } from 'node:crypto';

// Auth0 fix to get tests passing. This gets around the 'auth0-spa-js must run on a secure origin' error
// More info https://github.com/auth0/auth0-spa-js/blob/master/FAQ.md#why-do-you-get-auth0-spa-js-must-run-on-a-secure-origin
Object.defineProperty(window, 'crypto', {
  value: { subtle: {}, randomUUID },
  writable: true,
  configurable: true
});

// Datadog RUM does not initialize in jsdom
vi.mock('@datadog/browser-rum', () => ({
  datadogRum: { addAction: vi.fn(), init: vi.fn(), setUser: vi.fn() }
}));

// Datadog instrumentation context setter — no-op in tests
vi.mock('./instrumentation/setInstrumentationUserContext', () => ({
  setInstrumentationUserContext: vi.fn()
}));
