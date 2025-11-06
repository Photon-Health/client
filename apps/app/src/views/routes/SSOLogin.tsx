import { CircularProgress, Container, Heading, Stack, useBreakpointValue } from '@chakra-ui/react';
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
  const returnTo = searchParams.get('returnTo') ?? undefined;

  useEffect(() => {
    if (isAllowedReturnTo(returnTo)) {
      localStorage.setItem('authReturnTo', returnTo);
    }

    login({
      organizationId: orgId,
      connection
    });
  });

  return (
    <Container maxW="md" py={{ base: '12', md: '24' }}>
      <Stack spacing="8" textAlign="center">
        <Logo bgIsWhite margin="auto" />
        <Heading size={breakpoint}>Signing in...</Heading>
        <CircularProgress isIndeterminate color="green.300" margin="auto" />
      </Stack>
    </Container>
  );
};

function isAllowedReturnTo(returnTo: string | undefined): returnTo is string {
  if (!returnTo) return false;

  const allowedDomains = [
    'https://doximity.dev.doximity.cloud',
    'https://doximity.partners.doximity-staging.services'
  ];

  try {
    const url = new URL(returnTo);

    if (
      url.hostname === 'localhost' &&
      url.protocol === 'http:' &&
      (url.port === '3000' || url.port === '4000')
    ) {
      return true;
    }
    return allowedDomains.some((domain) => {
      return returnTo.startsWith(domain);
    });
  } catch {
    return false;
  }
}
