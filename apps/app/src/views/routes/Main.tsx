import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Center, CircularProgress, Box } from '@chakra-ui/react';

import { usePhoton } from '@photonhealth/react';
import { useEffect, useState } from 'react';
import { Nav } from '../components/Nav';
import { SelectOrg } from './SelectOrg';
import { addAlert } from '../../stores/alert';
import { auth0Config } from '../../configs/auth';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-client': unknown;
    }
  }
}

export const Main = () => {
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

  if (isLoading || (previouslyAuthed && !isAuthenticated)) {
    return (
      <Center h="100vh">
        <CircularProgress isIndeterminate color="green.300" />
      </Center>
    );
  }

  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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
        >
          <Nav />
          <Outlet />
        </photon-client>
      ) : null}
    </Box>
  );
};
