import { clinicalGql } from '@photonhealth/sdk/test-utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse } from 'msw';
import { beforeEach, expect, test, vi } from 'vitest';

import { harness, setupHarness } from '../../test-utils';
import { SelectOrg } from './SelectOrg';

// SelectOrg needs more of usePhoton than the global harness mock exposes
// (login/logout/setOrganization/getOrganizations), so override it here.
const photonMock = vi.hoisted(() => ({
  login: vi.fn(),
  logout: vi.fn(),
  setOrganization: vi.fn(),
  organizations: [] as { id: string; name: string }[]
}));

vi.mock('@photonhealth/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@photonhealth/react')>();
  const { harness } = await import('../../setupTests');
  return {
    ...actual,
    usePhoton: () => ({
      isAuthenticated: true,
      isLoading: false,
      user: { org_id: 'org_1' },
      clinicalClient: harness.photonClient.apolloClinical,
      getToken: async () => 'test-token',
      login: photonMock.login,
      logout: photonMock.logout,
      setOrganization: photonMock.setOrganization,
      getOrganizations: () => ({
        organizations: photonMock.organizations,
        loading: false
      })
    })
  };
});

const { server, renderWithProviders } = setupHarness();

type Invite = {
  __typename: 'OrganizationInvite';
  id: string;
  email: string;
  organizationId: string;
  organizationName: string;
  inviter: string;
  expired: boolean;
};

function makeInvite(overrides: Partial<Invite> = {}): Invite {
  return {
    __typename: 'OrganizationInvite',
    id: 'uinv_1',
    email: 'doc@example.com',
    organizationId: 'org_invited',
    organizationName: 'invited org',
    inviter: 'admin@example.com',
    expired: false,
    ...overrides
  };
}

function mockInvites(invites: Invite[]) {
  server.use(
    clinicalGql.query('MyInvites', () => HttpResponse.json({ data: { myInvites: invites } }))
  );
}

beforeEach(() => {
  photonMock.login.mockClear();
  photonMock.logout.mockClear();
  photonMock.setOrganization.mockClear();
  photonMock.organizations = [
    { id: 'org_a', name: 'alpha health' },
    { id: 'org_b', name: 'beta clinic' }
  ];
  harness.featureFlags.select_org_invites = true;
});

test('shows orgs and pending invites together; expired invites are hidden', async () => {
  mockInvites([
    makeInvite(),
    makeInvite({ id: 'uinv_2', organizationName: 'expired org', expired: true })
  ]);

  renderWithProviders(<SelectOrg />);

  expect(await screen.findByText('Alpha health')).toBeInTheDocument();
  expect(screen.getByText('Beta clinic')).toBeInTheDocument();

  expect(screen.getByText(/pending invitations/i)).toBeInTheDocument();
  expect(screen.getByText('Invited org')).toBeInTheDocument();
  expect(screen.getByText(/invited by admin@example.com/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /accept invite/i })).toBeInTheDocument();
  expect(screen.queryByText(/expired org/i)).not.toBeInTheDocument();
});

test('hides invites for orgs the user is already a member of', async () => {
  mockInvites([
    makeInvite(),
    makeInvite({ id: 'uinv_2', organizationId: 'org_a', organizationName: 'alpha health' })
  ]);

  renderWithProviders(<SelectOrg />);

  // org_a renders as a member org, but not as an invite
  expect(await screen.findByText('Invited org')).toBeInTheDocument();
  expect(screen.getByText('Alpha health')).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /accept invite/i })).toHaveLength(1);
});

test('de-dupes invites by org id, keeping same-name invites for different orgs', async () => {
  mockInvites([
    makeInvite(),
    // duplicate of the same org — collapsed
    makeInvite({ id: 'uinv_2', organizationName: 'Invited Org' }),
    // same name but a different org — kept
    makeInvite({ id: 'uinv_3', organizationId: 'org_other' })
  ]);

  renderWithProviders(<SelectOrg />);

  expect(await screen.findAllByRole('button', { name: /accept invite/i })).toHaveLength(2);
  expect(screen.getAllByText('Invited org')).toHaveLength(2);
});

test('accepting an invite logs in to the invited org', async () => {
  mockInvites([makeInvite({ organizationId: 'org_invited' })]);

  renderWithProviders(<SelectOrg />);

  await userEvent.click(await screen.findByRole('button', { name: /accept invite/i }));

  expect(photonMock.setOrganization).toHaveBeenCalledWith('org_invited');
  expect(photonMock.login).toHaveBeenCalledWith(
    expect.objectContaining({ organizationId: 'org_invited' })
  );
});

test('single org with a pending invite renders the page instead of auto-logging in', async () => {
  photonMock.organizations = [{ id: 'org_a', name: 'alpha health' }];
  mockInvites([makeInvite()]);

  renderWithProviders(<SelectOrg />);

  expect(await screen.findByText('Invited org')).toBeInTheDocument();
  expect(screen.getByText('Alpha health')).toBeInTheDocument();
  expect(photonMock.login).not.toHaveBeenCalled();
});

test('single org auto-logs in when the only invite is for that same org', async () => {
  photonMock.organizations = [{ id: 'org_a', name: 'alpha health' }];
  mockInvites([makeInvite({ organizationId: 'org_a', organizationName: 'alpha health' })]);

  renderWithProviders(<SelectOrg />);

  await waitFor(() => {
    expect(photonMock.login).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: 'org_a' })
    );
  });
});

test('flag off: invites are not shown', async () => {
  harness.featureFlags.select_org_invites = false;
  mockInvites([makeInvite()]);

  renderWithProviders(<SelectOrg />);

  expect(await screen.findByText('Alpha health')).toBeInTheDocument();
  expect(screen.queryByText(/pending invitations/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /accept invite/i })).not.toBeInTheDocument();
});

test('flag off: single org auto-logs in even with pending invites', async () => {
  harness.featureFlags.select_org_invites = false;
  photonMock.organizations = [{ id: 'org_a', name: 'alpha health' }];
  mockInvites([makeInvite()]);

  renderWithProviders(<SelectOrg />);

  await waitFor(() => {
    expect(photonMock.login).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: 'org_a' })
    );
  });
});

test('single org with no invites auto-logs in', async () => {
  photonMock.organizations = [{ id: 'org_a', name: 'alpha health' }];
  mockInvites([]);

  renderWithProviders(<SelectOrg />);

  await waitFor(() => {
    expect(photonMock.login).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: 'org_a' })
    );
  });
  expect(photonMock.setOrganization).toHaveBeenCalledWith('org_a');
});
