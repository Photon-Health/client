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
  const auth0QueryError = query.get('error_description');
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

  const presentedError = presentError(error, auth0QueryError);

  return (
    <Container maxW="md" py={{ base: '12', md: '24' }}>
      <Stack spacing="8">
        <Stack spacing="6">
          <Logo style={{ paddingLeft: '19.75px' }} bgIsWhite />
          {presentedError && !isLoading && (
            <Alert status="error">
              <AlertIcon />
              <VStack>
                <Text textAlign="left">{presentedError.line1}</Text>
                {presentedError.line2 ? <Text textAlign="left">{presentedError.line2}</Text> : null}
              </VStack>
            </Alert>
          )}
          <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
            <Heading size={breakpoint}>Log in to your account</Heading>
            {query.get('orgs') === '0' ? (
              <Alert status="warning">
                <AlertIcon />
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

const AUTH0_INVITE_ACCEPTED_BY_WRONG_EMAIL =
  'the specified account is not allowed to accept the current invitation';

const AUTH0_INVITE_NOT_FOUND_OR_ALREADY_USED = 'invitation not found or already used';

type PresentedError = {
  line1: string;
  line2?: string;
};

function presentError(error: any, auth0QueryError: string | null): PresentedError | null {
  if (error) {
    return {
      line1: 'Access Denied',
      line2: typeof error === 'string' ? error : undefined
    };
  }

  if (auth0QueryError === AUTH0_INVITE_ACCEPTED_BY_WRONG_EMAIL) {
    return {
      line1: 'This account was not the invited email address.',
      line2:
        'Please contact your administrator for another invite, and accept the invite from the invited email address account.'
    };
  }

  if (auth0QueryError === AUTH0_INVITE_NOT_FOUND_OR_ALREADY_USED) {
    return {
      line1: 'This invitation has expired or is no longer valid.',
      line2: 'Please ask your administrator for another invite.'
    };
  }

  return null;
}
