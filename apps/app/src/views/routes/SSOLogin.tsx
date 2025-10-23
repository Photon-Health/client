import { Container, Heading, Stack, useBreakpointValue } from '@chakra-ui/react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { usePhoton } from '@photonhealth/react';
import { Logo } from '../components/Logo';
import { useEffect, useRef } from 'react';

export const SSOLogin = () => {
  const breakpoint = useBreakpointValue({ base: 'xs', md: 'sm' });
  const { isAuthenticated, login } = usePhoton();

  const [searchParams] = useSearchParams();
  const orgId = searchParams.get('orgId') ?? undefined;
  const connection = searchParams.get('connection');
  const shouldLogin = useRef(true);

  useEffect(() => {
    if (connection && shouldLogin.current) {
      shouldLogin.current = false;
      (async () => {
        if (connection) {
          login({
            organizationId: orgId,
            connection
          });
        }
      })();
    }
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxW="md" py={{ base: '12', md: '24' }}>
      <Stack spacing="8">
        <Stack spacing="6">
          <Logo bgIsWhite margin="auto" />
          <Heading size={breakpoint}>Signing in...</Heading>
        </Stack>
      </Stack>
    </Container>
  );
};
