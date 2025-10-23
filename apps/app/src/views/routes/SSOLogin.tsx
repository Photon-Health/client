import { Container, Heading, Stack, useBreakpointValue } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';

import { usePhoton } from '@photonhealth/react';
import { Logo } from '../components/Logo';
import { useEffect } from 'react';

export const SSOLogin = () => {
  const breakpoint = useBreakpointValue({ base: 'xs', md: 'sm' });
  const { login } = usePhoton();
  const [searchParams] = useSearchParams();

  const orgId = searchParams.get('orgId') ?? undefined;
  const connection = searchParams.get('connection') ?? undefined;

  useEffect(() => {
    (async () => {
      await login({
        organizationId: orgId,
        connection
      });
    })();
  });

  return (
    <Container maxW="md" py={{ base: '12', md: '24' }}>
      <Stack spacing="8">
        <Stack spacing="6" margin="auto">
          <Logo bgIsWhite margin="auto" />
          <Heading size={breakpoint}>Signing in...</Heading>
        </Stack>
      </Stack>
    </Container>
  );
};
