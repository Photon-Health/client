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
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';

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

  const presentedError = presentError(error);

  return (
    <Container maxW="md" py={{ base: '12', md: '24' }}>
      <Stack spacing="8">
        <Stack spacing="6">
          <Logo bgIsWhite margin="auto" />
          {presentedError && !isLoading && (
            <Alert status="error">
              <AlertIcon />
              <VStack alignItems="start">
                <Text fontWeight="bold">{presentedError.line1}</Text>
                <Text>{presentedError.line2}</Text>
              </VStack>
            </Alert>
          )}
          <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
            <Heading size={breakpoint}>Log in to your account</Heading>
            {query.get('orgs') === '0' ? (
              <Alert status="warning">
                <AlertIcon />
                <VStack alignItems="start" textAlign="left">
                  <Text>
                    You tried logging in with an account not associated with any organizations.
                  </Text>
                  <Text>
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

const AUTH0_INVITE_ACCEPTED_BY_WRONG_EMAIL =
  'the specified account is not allowed to accept the current invitation';

const AUTH0_INVITE_NOT_FOUND_OR_ALREADY_USED = 'invitation not found or already used';

type PresentedError = {
  line1: string;
  line2: string;
};

function presentError(authError: string | undefined): PresentedError | null {
  if (authError === AUTH0_INVITE_ACCEPTED_BY_WRONG_EMAIL) {
    return {
      line1: 'Wrong email used',
      line2:
        'This invitation was sent to a different email address. Your invitation link has been invalidated for security reasons. Contact your team admin for a new invitation.'
    };
  }

  if (authError === AUTH0_INVITE_NOT_FOUND_OR_ALREADY_USED) {
    return {
      line1: 'Invitation expired',
      line2:
        'This invitation has expired and is no longer valid. Contact your team admin for a new invitation.'
    };
  }

  if (authError) {
    return {
      line1: 'Something went wrong',
      line2:
        typeof authError === 'string'
          ? authError
          : 'Please try again later. If you are trying to accept an invitation, contact your team admin for a new invitation.'
    };
  }

  return null;
}
