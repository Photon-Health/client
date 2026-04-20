import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, Center, CircularProgress } from '@chakra-ui/react';
import { usePhoton } from '@photonhealth/react';
import { useEffect } from 'react';
import { Nav } from '../components/Nav';
import { SelectOrg } from './SelectOrg';
import { auth0Config } from '../../configs/auth';
import useQueryParams from '../../hooks/useQueryParams';
import { Env } from '@photonhealth/sdk';
import { useWelcomeToast } from '../../hooks/useWelcomeToast';
import { gql, useQuery } from '@apollo/client';
import usePermissions from '../../hooks/usePermissions';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-client': unknown;
    }
  }
}

const canDoSomethingQuery = gql(/* GraphQL */ `
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

export const Main = () => {
  const query = useQueryParams();

  // Detect is browser is Safari
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const { user, isAuthenticated, isLoading, error, clinicalClient } = usePhoton();
  const location = useLocation();
  const navigate = useNavigate();
  const hasOverridePermission = usePermissions(['access:web_app']);

  const {
    data: canDoSomethingData,
    error: canDoSomethingError,
    loading: canDoSomethingLoading
  } = useQuery(canDoSomethingQuery, { client: clinicalClient });

  useWelcomeToast();

  useEffect(() => {
    if ((!isLoading && error) || (!canDoSomethingLoading && canDoSomethingError)) {
      navigate('/', { replace: true });
    }
  }, [isLoading, error, canDoSomethingLoading, canDoSomethingError, navigate]);

  if (isLoading || query.get('code')) {
    return (
      <Center h="100vh">
        <CircularProgress isIndeterminate color="green.300" />
      </Center>
    );
  }

  if (!isAuthenticated && !isLoading) {
    const pathname = location.pathname;
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return (
      <Navigate
        to={`/login${queryString}`}
        state={{
          from: { location },
          returnToAfterLogin: `${pathname}${queryString}`
        }}
        replace
      />
    );
  }

  if (canDoSomethingLoading) {
    return (
      <Center h="100vh">
        <CircularProgress isIndeterminate color="green.300" />
      </Center>
    );
  }

  const orgSettings = canDoSomethingData?.organization?.settings;
  const enableWebAppPrescribe = orgSettings?.providerUx?.enableWebAppPrescribe ?? true;

  if (isAuthenticated && !user?.org_id) return <SelectOrg />;

  if (isAuthenticated && !enableWebAppPrescribe && !hasOverridePermission) {
    return <Navigate to="/disallowed" />;
  }

  if (location.pathname === '/' && isAuthenticated) {
    if (user?.org_id) return <Navigate to="/prescriptions" replace />;
  }

  return (
    // For infinite scrolling, Safari expects body to be 100vh, while chrome/firefox expects heihgt auto
    <Box as="section" height={isSafari ? '100vh' : 'auto'} overflowY="auto">
      {isAuthenticated && user?.org_id ? (
        <photon-client
          id={auth0Config.clientId}
          org={user.org_id}
          domain={auth0Config.domain}
          audience={auth0Config.audience}
          uri={import.meta.env.VITE_GRAPHQL_URI as string}
          auto-login="false"
          env={import.meta.env.VITE_ENV_NAME as Env}
        >
          <Nav />
          <Box as="main" marginTop="16">
            <Outlet />
          </Box>
        </photon-client>
      ) : null}
    </Box>
  );
};
