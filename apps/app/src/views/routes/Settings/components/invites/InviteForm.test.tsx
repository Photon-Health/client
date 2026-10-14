import { clinicalGql } from '@photonhealth/sdk/test-utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse } from 'msw';
import { beforeEach, expect, test, vi } from 'vitest';

import { harness, setupHarness } from '../../../../../test-utils';
import { InviteForm } from './InviteForm';

const PRESCRIBER_ROLE = { id: 'rol_prescriber', name: 'Prescriber', description: 'Can prescribe' };
const ADMIN_ROLE = { id: 'rol_admin', name: 'Admin', description: 'Manages settings' };

const inviteUserSpy = vi.fn();

const { server, renderWithProviders } = setupHarness();

beforeEach(() => {
  inviteUserSpy.mockClear();

  server.use(
    clinicalGql.query('FaxPreferenceQuery', () =>
      HttpResponse.json({
        data: {
          organization: {
            __typename: 'Organization',
            settings: { contact: { rxPdf: { fromFaxPreference: 'organization' } } }
          }
        }
      })
    ),
    clinicalGql.query('AllRolesSelect', () =>
      HttpResponse.json({ data: { roles: [PRESCRIBER_ROLE, ADMIN_ROLE] } })
    ),
    clinicalGql.mutation('InviteUser', ({ variables }) => {
      inviteUserSpy(variables);
      return HttpResponse.json({ data: { inviteUser: { id: 'uinv_1' } } });
    })
  );
});

async function openWithPrescriberRole() {
  renderWithProviders(<InviteForm isOpen onClose={() => undefined} />);
  const user = userEvent.setup();

  await user.click(await screen.findByRole('combobox'));
  await user.click(await screen.findByText('Prescriber'));
  // blur the roles select so `touched.roles` is set
  await user.click(screen.getByLabelText(/email/i));

  return user;
}

const npiField = () => screen.queryByLabelText(/npi/i);
const prefillButton = () => screen.queryByRole('button', { name: /prefill prescriber data/i });
const sparseButton = () =>
  screen.queryByRole('button', { name: /fill in their personal details/i });

test('flag off: prescriber details are shown and required as before', async () => {
  harness.featureFlags.allow_sparse_invites = false;
  await openWithPrescriberRole();

  expect(await screen.findByLabelText(/npi/i)).toBeRequired();
  expect(prefillButton()).not.toBeInTheDocument();
});

test('flag on: only email is required, with a prefill button', async () => {
  harness.featureFlags.allow_sparse_invites = true;
  await openWithPrescriberRole();

  expect(
    await screen.findByRole('button', { name: /prefill prescriber data/i })
  ).toBeInTheDocument();
  expect(npiField()).not.toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeRequired();
});

test('flag on: prefill reveals the details; opting out clears and hides them', async () => {
  harness.featureFlags.allow_sparse_invites = true;
  const user = await openWithPrescriberRole();

  await user.click(await screen.findByRole('button', { name: /prefill prescriber data/i }));
  expect(await screen.findByLabelText(/npi/i)).toBeRequired();
  expect(sparseButton()).toBeInTheDocument();

  await user.type(screen.getByLabelText(/npi/i), '1234567890');
  await user.click(sparseButton() as HTMLElement);

  expect(npiField()).not.toBeInTheDocument();
  expect(sparseButton()).not.toBeInTheDocument();

  await user.click(prefillButton() as HTMLElement);
  expect(await screen.findByLabelText(/npi/i)).toHaveValue('');
});

test('flag on: sparse prescriber invite is sent without provider details', async () => {
  harness.featureFlags.allow_sparse_invites = true;
  const user = await openWithPrescriberRole();

  await user.type(screen.getByLabelText(/email/i), 'doc@example.com');
  const submit = screen.getByRole('button', { name: /send invitation/i });
  await waitFor(() => expect(submit).toBeEnabled());
  await user.click(submit);

  await waitFor(() => expect(inviteUserSpy).toHaveBeenCalledTimes(1));
  expect(inviteUserSpy).toHaveBeenCalledWith({
    email: 'doc@example.com',
    roles: [PRESCRIBER_ROLE.id]
  });
});

test('flag off: prescriber invite cannot be sent with only an email', async () => {
  harness.featureFlags.allow_sparse_invites = false;
  const user = await openWithPrescriberRole();

  await user.type(screen.getByLabelText(/email/i), 'doc@example.com');

  await waitFor(() =>
    expect(screen.getByRole('button', { name: /send invitation/i })).toBeDisabled()
  );
  expect(inviteUserSpy).not.toHaveBeenCalled();
});
