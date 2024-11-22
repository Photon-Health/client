import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Center, CircularProgress, Box } from '@chakra-ui/react';

import { usePhoton } from '@photonhealth/react';
import { useEffect, useState } from 'react';
import { Nav } from '../components/Nav';
import { SelectOrg } from './SelectOrg';
import { addAlert } from '../../stores/alert';
import { auth0Config } from '../../configs/auth';
import useQueryParams from '../../hooks/useQueryParams';
import { Env } from '@photonhealth/sdk';
import { datadogRum } from '@datadog/browser-rum';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-client': unknown;
    }
  }
}

export const Main = () => {
  const query = useQueryParams();

  // Detect is browser is Safari
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const { user, isAuthenticated, isLoading, error, clearError } = usePhoton();
  const [previouslyAuthed, setPreviouslyAuthed] = useState(
    localStorage.getItem('previouslyAuthed') != null || false
  );
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      localStorage.setItem('previouslyAuthed', 'true');
      setPreviouslyAuthed(true);
    }
    if (!isLoading && !isAuthenticated && !error) {
      localStorage.removeItem('previouslyAuthed');
      setPreviouslyAuthed(false);
    }
    if (isAuthenticated && !isLoading) {
      // global context to the datadog RUM session
      datadogRum.setGlobalContextProperty('org', {
        orgId: user.org_id
      });
      datadogRum.setUser({
        email: user.email,
        name: user.name
      });
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isLoading && error) {
      if (error.includes('Invalid state')) {
        clearError();
      } else if (error.includes('invitation not found or already used')) {
        addAlert({ message: error, type: 'error' });
        clearError();
        navigate('/', { replace: true });
      } else {
        addAlert({ message: error, type: 'error' });
        clearError();
      }
    }
  }, [isLoading, error]);

  if (query.get('error_description') === 'invitation not found or already used') {
    // https://www.notion.so/photons/Handle-auth0-Error-States-on-Login-3486ee6a8e5d4c60a2db091f8f0cbd78?pvs=4
    // In this error state, instead of endless loop we can just kick the user back login with an error message
    return <Navigate to="/login?orgs=0" replace />;
  }

  if (isLoading || (previouslyAuthed && !isAuthenticated) || query.get('code')) {
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
          returnTo: `${pathname}${queryString}`
        }}
        replace
      />
    );
  }

  if (location.pathname === '/' && isAuthenticated) {
    if (user?.org_id) return <Navigate to="/prescriptions" replace />;
  }

  if (isAuthenticated && !user?.org_id) return <SelectOrg />;

  return (
    // For infinite scrolling, Safari expects body to be 100vh, while chrome/firefox expects heihgt auto
    <Box as="section" height={isSafari ? '100vh' : 'auto'} overflowY="auto">
      {isAuthenticated && user?.org_id ? (
        <photon-client
          id={auth0Config.clientId}
          org={user.org_id}
          domain={auth0Config.domain}
          audience={auth0Config.audience}
          uri={process.env.REACT_APP_GRAPHQL_URI as string}
          auto-login="false"
          env={process.env.REACT_APP_ENV_NAME as Env}
        >
          <Nav />
          <Outlet />
        </photon-client>
      ) : null}
    </Box>
  );
};
