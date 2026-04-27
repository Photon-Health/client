import { Outlet } from 'react-router-dom';
import { Center, CircularProgress } from '@chakra-ui/react';
import { usePhoton } from '@photonhealth/react';
import { useWelcomeToast } from '../../hooks/useWelcomeToast';
import usePermissions from '../../hooks/usePermissions';
import { gql, useQuery } from '@apollo/client';
import { Disallowed } from './Disallowed';

const allowedOnWebAppQuery = gql(/* GraphQL */ `
  query OrgSettingsQuery {
    organization {
      settings {
        providerUx {
          enableWebAppPrescribe
        }
      }
    }
  }
`);

export const AppOverride = () => {
  const { clinicalClient } = usePhoton();

  const hasOverridePermission = usePermissions(['access_override:web_app']);

  const { data: allowedOnWebAppData, loading: allowedOnWebAppLoading } = useQuery(
    allowedOnWebAppQuery,
    { client: clinicalClient }
  );

  useWelcomeToast();

  if (allowedOnWebAppLoading) {
    return (
      <Center h="100vh">
        <CircularProgress isIndeterminate color="green.300" />
      </Center>
    );
  }

  const orgSettings = allowedOnWebAppData?.organization?.settings;
  const enableWebAppPrescribe = orgSettings?.providerUx?.enableWebAppPrescribe ?? true;
  const shouldDisallow = !enableWebAppPrescribe && !hasOverridePermission;

  const render = shouldDisallow ? <Disallowed /> : <Outlet />;

  return render;
};
