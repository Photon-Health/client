import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';

import { setupHarness } from '../../../test-utils';
import { LinkConfirmation } from './LinkConfirmation';

const { renderWithProviders } = setupHarness();

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
  expect(screen.getByText(/you will not be able to link again/i)).toBeInTheDocument();
});

test('deny link navigates to the auth api decline endpoint', async () => {
  renderWithProviders(<LinkConfirmation />, { initialEntries: [url] });

  await userEvent.click(screen.getByRole('button', { name: /deny link/i }));

  expect(assign).toHaveBeenCalledWith('https://auth-api.boson.health/decline');
});

test('link navigates to the auth api link endpoint', async () => {
  renderWithProviders(<LinkConfirmation />, { initialEntries: [url] });

  await userEvent.click(screen.getByRole('button', { name: /^link$/i }));

  expect(assign).toHaveBeenCalledWith('https://auth-api.boson.health/link');
});
