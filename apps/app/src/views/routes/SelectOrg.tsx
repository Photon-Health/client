import {
  Button,
  Card,
  Center,
  CircularProgress,
  Container,
  Divider,
  HStack,
  Stack,
  Text
} from '@chakra-ui/react';

import { FiLogIn } from 'react-icons/fi';

import { useQuery } from '@apollo/client';
import { useLocation, useSearchParams } from 'react-router-dom';
import { usePhoton } from '@photonhealth/react';
import { useEffect, useMemo } from 'react';

import { useFeatureFlag } from '../../hooks/useFeatureFlag';
import { myInvitesQuery } from '../../queries/clinical-api';

const displayName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

export const SelectOrg = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const from = `${(location.pathname || '/') + (location.search || '')}`;

  const { login, logout, getOrganizations, setOrganization, clinicalClient } = usePhoton();
  const { organizations, loading } = getOrganizations();

  // Not passing in any user ID here, just using this as a basic "on-off" switch.
  const { enabled: invitesEnabled, loading: flagLoading } = useFeatureFlag('select_org_invites');

  const { data: invitesData, loading: invitesLoading } = useQuery(myInvitesQuery, {
    client: clinicalClient,
    skip: !invitesEnabled
  });

  const pendingInvites = useMemo(() => {
    if (!invitesEnabled) {
      return [];
    }
    const memberOrgIds = new Set<string>(
      (organizations || []).map((org: { id: string }) => org.id)
    );
    const seenOrgIds = new Set<string>();
    return (invitesData?.myInvites ?? []).filter((invite) => {
      if (invite.expired || memberOrgIds.has(invite.organizationId)) {
        return false;
      }
      const orgId = invite.organizationId;
      if (seenOrgIds.has(orgId)) {
        return false;
      }
      seenOrgIds.add(orgId);
      return true;
    });
  }, [organizations, invitesData, invitesEnabled]);

  useEffect(() => {
    if (loading || flagLoading || invitesLoading) {
      return;
    }

    // A user with pending invites always sees this page, even if they would
    // otherwise be auto-logged-in (one org) or logged out (no orgs).
    if (pendingInvites.length > 0) {
      return;
    }

    if (organizations?.length === 0) {
      const queryString = location.search.replace(/^\?/, '');
      const searchParams = new URLSearchParams(queryString);
      searchParams.append('orgs', '0');

      if (location?.pathname && location?.pathname !== '/') {
        searchParams.append('pathname', location.pathname);
      }

      logout({ returnTo: `${window.location.origin}?${searchParams.toString()}` });
    } else if (organizations?.length === 1) {
      setOrganization(organizations[0].id);
      login({
        appState: {
          returnTo: from
        },
        organizationId: organizations[0].id
      });
    }
  }, [organizations, loading, flagLoading, invitesLoading, pendingInvites]);

  useEffect(() => {
    if (searchParams.has('orgs')) {
      searchParams.delete('orgs');
      searchParams.delete('pathname');
      setSearchParams(searchParams);
    }
  }, []);

  const orgs = (organizations || []).map((organization: any) => {
    const { id, name } = organization;

    return (
      <HStack key={name} justify="space-between">
        <Text fontSize="lg" fontWeight="medium">
          {displayName(name)}
        </Text>
        <Button
          key={id}
          size="sm"
          variant="primary"
          rightIcon={<FiLogIn />}
          value={id}
          onClick={() => {
            setOrganization(id);
            login({
              organizationId: id,
              appState: {
                returnTo: from
              }
            });
          }}
        >
          Select
        </Button>
      </HStack>
    );
  });

  const invites = pendingInvites.map((invite) => (
    <HStack key={invite.id} justify="space-between">
      <Stack spacing="0">
        <Text fontSize="lg" fontWeight="medium">
          {displayName(invite.organizationName)}
        </Text>
        <Text color="muted" fontSize="sm">
          Invited by {invite.inviter}
        </Text>
      </Stack>
      <Button
        size="sm"
        variant="primary"
        rightIcon={<FiLogIn />}
        value={invite.organizationId}
        onClick={() => {
          setOrganization(invite.organizationId);
          login({
            organizationId: invite.organizationId,
            appState: {
              returnTo: from
            }
          });
        }}
      >
        Join
      </Button>
    </HStack>
  ));

  if (loading || flagLoading || invitesLoading) {
    return (
      <Center padding="1.5em" height="100vh">
        <CircularProgress isIndeterminate color="green.300" />
      </Center>
    );
  }

  return (
    <Container maxW="2xl">
      {(organizations?.length > 1 || pendingInvites.length > 0) && (
        <Card p={5} mt={5} borderTopWidth="4px" borderColor="accent">
          <Stack spacing="3">
            <Text fontSize="lg" fontWeight="medium" alignSelf="center">
              Select an organization
            </Text>
            <Text color="muted" fontSize="sm" alignSelf="center">
              {organizations?.length > 1
                ? 'You are a member of multiple organizations. Please choose the organization you would like to log in to.'
                : 'You have pending invitations. Accept an invitation to continue.'}
            </Text>
            {organizations?.length > 0 && (
              <>
                <Divider />
                {orgs}
              </>
            )}
            {pendingInvites.length > 0 && (
              <>
                <Divider />
                <Text fontSize="md" fontWeight="medium">
                  Pending invitations
                </Text>
                {invites}
              </>
            )}
          </Stack>
        </Card>
      )}
    </Container>
  );
};
