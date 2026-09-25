import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';

import { setupHarness } from '../../../test-utils';
import { LinkConfirmation } from './LinkConfirmation';

const { renderWithProviders } = setupHarness();

const url = '/link?email=doc%40example.com&connection=google-oauth2';

afterEach(() => {
  vi.restoreAllMocks();
});

test('renders the email and connection from the query string', () => {
  renderWithProviders(<LinkConfirmation />, { initialEntries: [url] });

  expect(screen.getByText(/we detected another account/i)).toHaveTextContent(
    /under the email doc@example\.com and signed on with google-oauth2/
  );
  expect(screen.getByText(/you will not be able to link again/i)).toBeInTheDocument();
});

test('shows deny link and link buttons', () => {
  renderWithProviders(<LinkConfirmation />, { initialEntries: [url] });

  expect(screen.getByRole('button', { name: /deny link/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^link$/i })).toBeInTheDocument();
});

test('clicking deny link logs to the console', async () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  renderWithProviders(<LinkConfirmation />, { initialEntries: [url] });

  await userEvent.click(screen.getByRole('button', { name: /deny link/i }));

  expect(log).toHaveBeenCalledWith(
    'deny link',
    expect.objectContaining({ email: 'doc@example.com' })
  );
});

test('clicking link logs to the console', async () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  renderWithProviders(<LinkConfirmation />, { initialEntries: [url] });

  await userEvent.click(screen.getByRole('button', { name: /^link$/i }));

  expect(log).toHaveBeenCalledWith(
    'link',
    expect.objectContaining({ connection: 'google-oauth2' })
  );
});
