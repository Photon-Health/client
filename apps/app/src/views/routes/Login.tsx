import {
  Alert,
  AlertIcon,
  Container,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
  useBreakpointValue,
  VStack
} from '@chakra-ui/react';

import { useLocation, useSearchParams, Navigate } from 'react-router-dom';

import { usePhoton } from '@photonhealth/react';
import { Logo } from '../components/Logo';
import { Auth } from '../components/Auth';
import useQueryParams from '../../hooks/useQueryParams';

export const Login = () => {
  const breakpoint = useBreakpointValue({ base: 'xs', md: 'sm' });
  const query = useQueryParams();

  const { isAuthenticated, login, error, isLoading } = usePhoton();
  const location = useLocation() as any;

  // Handle invite with redirect, even if logged in
  const [searchParams] = useSearchParams();
  const invite = searchParams.get('invitation');
  const org = searchParams.get('organization');

  if (invite && org) {
    login({
      organizationId: org,
      invitation: invite
    });
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container maxW="md" py={{ base: '12', md: '24' }}>
      <Stack spacing="8">
        <Stack spacing="6">
          <Logo style={{ paddingLeft: '19.75px' }} bgIsWhite />
          {error && !isLoading && (
            <Alert status="error">
              <AlertIcon />
              Access Denied
            </Alert>
          )}
          <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
            <Heading size={breakpoint}>Log in to your account</Heading>
            {query.get('orgs') === '0' ? (
              <Alert status="warning">
                <AlertIcon />
                {/* the text below, but left aligned */}
                <VStack>
                  <Text textAlign="left">
                    You tried logging in with an account not associated with any organizations.
                  </Text>
                  <Text textAlign="left">
                    Please check your email for an invite, or ask your administrator for assistance.
                  </Text>
                </VStack>
              </Alert>
            ) : null}
            <HStack spacing="1" justify="center">
              <Text color="muted">Don't have an account?</Text>
              <Link color="teal.500" href="mailto:sales@photon.health">
                Contact Sales
              </Link>
            </HStack>
          </Stack>
        </Stack>
        <Stack spacing="4">
          <Auth returnTo={location.state?.returnTo} />
        </Stack>
      </Stack>
    </Container>
  );
};
