import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { setupHarness } from '../../../test-utils';
import { Requests } from '.';
import { RequestDetail } from './RequestDetail';
import { DRAFT_ID, networkApiHandlers } from './testFixtures';

const calls: { operation: string; variables: Record<string, any> }[] = [];
const { server, renderWithProviders } = setupHarness();

beforeEach(() => {
  vi.stubEnv('VITE_ENV_NAME', 'boson');
  calls.length = 0;
  server.use(...networkApiHandlers(calls));
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const renderApp = (path = '/requests') =>
  renderWithProviders(
    <Routes>
      <Route path="/requests" element={<Requests />} />
      <Route path="/requests/:requestId" element={<RequestDetail />} />
    </Routes>,
    { initialEntries: [path] }
  );

const operations = (name: string) => calls.filter((call) => call.operation === name);

const claimFromList = async () => {
  const user = userEvent.setup();
  renderApp();
  await user.click(await screen.findByRole('button', { name: 'Claim' }));
  await screen.findByText('Achilles R. · ella 30 mg');
  return user;
};

test('lists unclaimed requests with patient, request, submitted time, urgency, and tab counts', async () => {
  renderApp();

  const row = (await screen.findByText('Achilles R.')).closest('tr')!;
  expect(row).toHaveTextContent('29 · CO');
  expect(row).toHaveTextContent('ella 30 mg');
  expect(row).toHaveTextContent('Emergency contraception');
  expect(row).toHaveTextContent('12 min ago');
  expect(row).toHaveTextContent('52 h left in window');
  expect(row).toHaveTextContent('Unclaimed');
  expect(await screen.findByRole('tab', { name: /To review\s*1/ })).toBeInTheDocument();
  expect(operations('PhotonPpDraftOrders')[0].variables.filter).toBe('UNCLAIMED');
});

test('each tab lists its own filter', async () => {
  const user = userEvent.setup();
  renderApp();
  await screen.findByText('Achilles R.');

  await user.click(screen.getByRole('tab', { name: /Waiting on patient/ }));

  await waitFor(() =>
    expect(operations('PhotonPpDraftOrders').at(-1)?.variables.filter).toBe('WAITING_ON_PATIENT')
  );
  expect(await screen.findByText('No requests here')).toBeInTheDocument();
});

test('claiming opens the request with intake answers, the draft prescription, and fill history', async () => {
  await claimFromList();

  expect(operations('ClaimDraftOrder')[0].variables.id).toBe(DRAFT_ID);
  expect(screen.getByText('Claimed by you')).toBeInTheDocument();
  expect(screen.getByText('Time since unprotected sex')).toBeInTheDocument();
  expect(screen.getByText('Not answered')).toBeInTheDocument();
  expect(screen.getByText('Take 1 tablet by mouth as soon as possible')).toBeInTheDocument();
  expect(screen.getByText(/CVS · 1600 16th St, Denver/)).toBeInTheDocument();
  expect(await screen.findByText('Amoxicillin 500 mg')).toBeInTheDocument();
  expect(operations('PhotonPpPatientHistory')[0].variables.patientId).toBe('pat_pp');
});

test('asking the patient sends the question with its reason and moves the request to waiting', async () => {
  const user = await claimFromList();

  await user.click(screen.getByRole('button', { name: 'Ask patient' }));
  await user.click(await screen.findByLabelText('Are you currently breastfeeding?'));
  await user.click(screen.getByRole('button', { name: 'Send question' }));

  await waitFor(() => expect(operations('SetDraftOrderWaitingForPatient')).toHaveLength(1));
  expect(operations('AddDraftOrderQuestions')[0].variables.questions).toEqual([
    {
      key: 'breastfeeding',
      text: 'Are you currently breastfeeding?',
      reason: expect.stringContaining('ella can pass into breast milk')
    }
  ]);
  expect(operations('SetDraftOrderWaitingForPatient')[0].variables.waitingForPatient).toBe(true);
  expect(await screen.findAllByText('Waiting on patient')).not.toHaveLength(0);
  expect(screen.getByText('Waiting for the patient')).toBeInTheDocument();
});

test('declining requires a reason and closes the request', async () => {
  const user = await claimFromList();

  await user.click(screen.getByRole('button', { name: 'Decline' }));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByRole('button', { name: 'Decline request' })).toBeDisabled();
  await user.type(within(dialog).getByRole('textbox'), 'Outside the treatment window');
  await user.click(within(dialog).getByRole('button', { name: 'Decline request' }));

  expect(await screen.findByText('Declined: Outside the treatment window')).toBeInTheDocument();
  expect(operations('RejectDraftOrder')[0].variables).toEqual(
    expect.objectContaining({ id: DRAFT_ID, reason: 'Outside the treatment window' })
  );
  expect(screen.queryByRole('button', { name: 'Approve & send' })).not.toBeInTheDocument();
});

test('approving writes and signs the modified prescription for my patient, then sends the draft with it', async () => {
  const user = await claimFromList();

  await user.click(screen.getByRole('button', { name: 'Modify' }));
  const directions = screen.getByLabelText('Directions');
  await user.clear(directions);
  await user.type(directions, 'Take 1 tablet by mouth today');
  await user.click(screen.getByRole('button', { name: 'Approve & send' }));
  const confirm = (await screen.findByText('Approve and send this prescription?')).parentElement!;
  await user.click(
    within(confirm.closest('section') ?? confirm).getByRole('button', { name: 'Approve & send' })
  );

  await waitFor(() => expect(operations('ApproveDraftOrder')).toHaveLength(1));
  const [written, signed] = operations('NetworkPrescription');
  expect(written.variables.prescription).toEqual(
    expect.objectContaining({
      patient: { id: 'pat_mine' },
      treatment: { id: 'med_ella' },
      instructions: 'Take 1 tablet by mouth today'
    })
  );
  expect(signed.variables.prescription).toEqual(
    expect.objectContaining({
      id: 'rx_mine_0',
      signing: expect.objectContaining({ signedHash: 'hash_rx_mine_0' })
    })
  );
  expect(operations('ApproveDraftOrder')[0].variables).toEqual(
    expect.objectContaining({ id: DRAFT_ID, prescriptionIds: ['rx_mine_0'] })
  );
});
