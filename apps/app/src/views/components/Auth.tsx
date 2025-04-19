import { Button, Stack } from '@chakra-ui/react';

import { usePhoton } from '@photonhealth/react';
import { graphql } from 'apps/app/src/gql';
import { useQuery } from '@apollo/client';

interface AuthProps {
  returnTo?: string;
}

const orgSettingsQuery = graphql(/* GraphQL */ `
  query AuthComponentOrgSettingsQuery {
    organization {
      settings {
        providerUx {
          federatedAuth
        }
      }
    }
  }
`);

export const Auth = (props: AuthProps) => {
  const { returnTo } = props;
  const { clinicalClient, isLoading, isAuthenticated, login, logout } = usePhoton();
  const { data } = useQuery(orgSettingsQuery, { client: clinicalClient });
  const federated = data?.organization?.settings?.providerUx?.federatedAuth ?? false;

  if (isLoading) return <Button isLoading loadingText="Loading" colorScheme="gray" />;

  if (isAuthenticated)
    return (
      <Stack direction="row" spacing={4}>
        <Button
          colorScheme="brand"
          onClick={() => {
            localStorage.removeItem('previouslyAuthed');
            logout({ returnTo: window.location.href, federated });
          }}
        >
          Log out
        </Button>
      </Stack>
    );

  return (
    <Button colorScheme="blue" onClick={() => login({ appState: { returnTo } })}>
      Log in
    </Button>
  );
};

Auth.defaultProps = { returnTo: '/' };
