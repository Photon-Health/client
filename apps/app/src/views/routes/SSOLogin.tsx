import {
  Button,
  CircularProgress,
  Container,
  Heading,
  Stack,
  useBreakpointValue
} from '@chakra-ui/react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { usePhoton } from '@photonhealth/react';
import { Logo } from '../components/Logo';
import { useEffect } from 'react';

export const SSOLogin = () => {
  const breakpoint = useBreakpointValue({ base: 'xs', md: 'sm' });
  const { login, loginWithPopup, isAuthenticated } = usePhoton();
  const [searchParams] = useSearchParams();

  const orgId = searchParams.get('orgId') ?? undefined;
  const connection = searchParams.get('connection') ?? undefined;
  const popup = Boolean(searchParams.get('popup')) ?? false;

  useEffect(() => {
    if (!popup && !isAuthenticated) {
      login({
        organizationId: orgId,
        connection
      });
    }
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxW="md" py={{ base: '12', md: '24' }}>
      <Stack spacing="8" textAlign="center">
        <Logo bgIsWhite margin="auto" />
        <Heading size={breakpoint}>{popup ? 'Click continue to sign in' : 'Signing in...'}</Heading>
        {popup ? (
          <Button
            type="button"
            variant="solid"
            onClick={async () => {
              await loginWithPopup({ organizationId: orgId, connection });
            }}
          >
            Continue
          </Button>
        ) : (
          <CircularProgress isIndeterminate color="green.300" margin="auto" />
        )}
      </Stack>
    </Container>
  );
};
