import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';

import { setupHarness } from '../../../test-utils';
import { Requests } from '.';
import { RequestDetail } from './RequestDetail';
import { DRAFT_ID, networkApiHandlers } from './testFixtures';

const calls: { operation: string; variables: Record<string, any> }[] = [];
const { server, renderWithProviders } = setupHarness();

beforeEach(() => {
  vi.stubEnv('VITE_ENV_NAME', 'boson');
  vi.stubEnv('PHOTON_PP_AUTH_TOKEN', 'pp-token');
  vi.stubEnv('PHOTON_PP_DRAFT_ORDER_IDS', DRAFT_ID);
  calls.length = 0;
  localStorage.clear();
  server.use(...networkApiHandlers(calls));
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const renderApp = () =>
  renderWithProviders(
    <Routes>
      <Route path="/requests" element={<Requests />} />
      <Route path="/requests/:requestId" element={<RequestDetail />} />
    </Routes>,
    { initialEntries: ['/requests'] }
  );

test('lists draft requests with patient, request and urgency', async () => {
  renderApp();

  const row = (await screen.findByText('Achilles R.')).closest('tr')!;
  expect(row).toHaveTextContent('29 · CO');
  expect(row).toHaveTextContent('Ella');
  expect(row).toHaveTextContent('Emergency contraception');
  expect(row).toHaveTextContent('52 h left in window');
  expect(row).toHaveTextContent('Unclaimed');
});

test('claiming opens the request, and approving sends it and removes it from the inbox', async () => {
  const user = userEvent.setup();
  renderApp();

  await user.click(await screen.findByRole('button', { name: 'Claim' }));

  expect(await screen.findByText('Achilles R. · Ella')).toBeInTheDocument();
  expect(screen.getByText('Claimed by you')).toBeInTheDocument();
  expect(screen.getByText('Time since unprotected sex')).toBeInTheDocument();
  expect(screen.getByText('Take 1 tablet by mouth as soon as possible')).toBeInTheDocument();
  expect(screen.getByText(/CVS · 1600 16th St, Denver/)).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Approve & send' }));
  const dialog = (await screen.findByText('Approve and send this prescription?')).parentElement!;
  await user.click(within(dialog).getByRole('button', { name: 'Approve & send' }));

  await waitFor(() =>
    expect(calls.at(-1)?.variables.input).toEqual({
      order: { id: 'ordd_new' },
      state: 'SUBMITTED'
    })
  );
  expect(await screen.findByText('No requests to review')).toBeInTheDocument();
});

test('decline does nothing', async () => {
  const user = userEvent.setup();
  renderApp();

  await user.click(await screen.findByRole('button', { name: 'Claim' }));
  await user.click(await screen.findByRole('button', { name: 'Decline' }));

  expect(screen.getByText('Achilles R. · Ella')).toBeInTheDocument();
  expect(calls.map((c) => c.operation)).toEqual(['NetworkOrder', 'NetworkOrder']);
});
