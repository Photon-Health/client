import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';

import { setupHarness } from '../../../test-utils';
import { LinkConfirmation } from './LinkConfirmation';

// `configs/auth` reads VITE_AUTH_API_DOMAIN at module scope,
// so stub it before any import is evaluated.
const AUTH_API_DOMAIN = vi.hoisted(() => {
  const domain = 'auth-api.test.health';
  vi.stubEnv('VITE_AUTH_API_DOMAIN', domain);
  return domain;
});

const { renderWithProviders, logoutSpy } = setupHarness();

const url = '/link-accounts?email=d%2A%2A%2A%40example.com&connection=google-oauth2';

// jsdom's Location is unforgeable, so swap in a stub we can assert against.
const assign = vi.fn();
beforeEach(() => {
  assign.mockClear();
  vi.stubGlobal('location', { ...window.location, assign });
});

test('renders the email and connection from the query string', () => {
  renderWithProviders(<LinkConfirmation />, { initialEntries: [url] });

  expect(screen.getByText(/we detected another account/i)).toHaveTextContent(
    /under the email d\*\*\*@example\.com and signed on with google-oauth2/
  );
  expect(screen.getByText(/linking .* is required to continue/i)).toBeInTheDocument();
  expect(screen.getByText(/you can log out instead/i)).toBeInTheDocument();
  expect(screen.getByText(/no longer have access to this account/i)).toHaveTextContent(
    /sign up with a different email or reach out to support@photon\.health/
  );
  expect(screen.getByRole('link', { name: 'support@photon.health' })).toHaveAttribute(
    'href',
    'mailto:support@photon.health'
  );
});

test('logout logs the user out and returns them to the app origin', async () => {
  renderWithProviders(<LinkConfirmation />, { initialEntries: [url] });

  await userEvent.click(screen.getByRole('button', { name: /logout/i }));

  expect(logoutSpy).toHaveBeenCalledWith({ returnTo: window.location.origin });
  expect(assign).not.toHaveBeenCalled();
});

test('link navigates to the auth api link endpoint', async () => {
  renderWithProviders(<LinkConfirmation />, { initialEntries: [url] });

  await userEvent.click(screen.getByRole('button', { name: /^link$/i }));

  expect(assign).toHaveBeenCalledWith(`https://${AUTH_API_DOMAIN}/link`);
});
