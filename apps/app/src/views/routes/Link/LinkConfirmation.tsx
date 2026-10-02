import {
  Button,
  Container,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
  useBreakpointValue
} from '@chakra-ui/react';
import { usePhoton } from '@photonhealth/react';
import { useSearchParams } from 'react-router-dom';

import { authApiDomain } from '../../../configs/auth';
import { Logo } from '../../components/Logo';

/**
 * Public (no login required) page that requires a user to link the sign-in
 * they just used with an existing account we found under the same email.
 * The only alternative is to log out entirely.
 */
export const LinkConfirmation = () => {
  const breakpoint = useBreakpointValue({ base: 'xs', md: 'sm' });
  const [searchParams] = useSearchParams();
  const { logout } = usePhoton();

  const email = searchParams.get('email') ?? '';
  const connection = searchParams.get('connection') ?? '';

  const onLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  const onLink = () => {
    window.location.assign(`https://${authApiDomain}/link`);
  };

  return (
    <Container maxW="md" py={{ base: '12', md: '24' }}>
      <Stack spacing="8">
        <Logo bgIsWhite margin="auto" />
        <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
          <Heading size={breakpoint}>Link your accounts to continue</Heading>
          <Text color="gray.600">
            We detected another account with us under the email{' '}
            <Text as="span" fontWeight="bold">
              {email}
            </Text>{' '}
            and signed on with{' '}
            <Text as="span" fontWeight="bold">
              {connection}
            </Text>
            . Linking this sign-in with that account is required to continue.
          </Text>
          <Text color="gray.500" fontSize="sm">
            If you no longer have access to this account, sign up with a different email or reach
            out to{' '}
            <Link href="mailto:support@photon.health" color="blue.500">
              support@photon.health
            </Link>{' '}
            for more info.
          </Text>
        </Stack>
        <HStack spacing="4" justify="center">
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
          <Button colorScheme="blue" onClick={onLink}>
            Link
          </Button>
        </HStack>
      </Stack>
    </Container>
  );
};
