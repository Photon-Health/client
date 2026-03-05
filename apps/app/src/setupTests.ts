import '@testing-library/jest-dom';

// Auth0 fix to get tests passing. This gets around the 'auth0-spa-js must run on a secure origin' error
// More info https://github.com/auth0/auth0-spa-js/blob/master/FAQ.md#why-do-you-get-auth0-spa-js-must-run-on-a-secure-origin
Object.defineProperty(window, 'crypto', {
  value: { subtle: {} },
  writable: true,
  configurable: true
});
