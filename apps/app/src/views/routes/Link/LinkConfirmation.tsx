import {
  Button,
  Container,
  Heading,
  HStack,
  Stack,
  Text,
  useBreakpointValue
} from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';

import { Logo } from '../../components/Logo';

/**
 * Public (no login required) page that asks a user whether to link the sign-in
 * they just used with an existing account we found under the same email.
 *
 * Reached via `/link?email=...&connection=...`.
 */
export const LinkConfirmation = () => {
  const breakpoint = useBreakpointValue({ base: 'xs', md: 'sm' });
  const [searchParams] = useSearchParams();

  const email = searchParams.get('email') ?? '';
  const connection = searchParams.get('connection') ?? '';

  const onDenyLink = () => {
    console.log('deny link', { email, connection });
  };

  const onLink = () => {
    console.log('link', { email, connection });
  };

  return (
    <Container maxW="md" py={{ base: '12', md: '24' }}>
      <Stack spacing="8">
        <Logo bgIsWhite margin="auto" />
        <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
          <Heading size={breakpoint}>Link your accounts?</Heading>
          <Text color="gray.600">
            We detected another account with us under the email{' '}
            <Text as="span" fontWeight="bold">
              {email}
            </Text>{' '}
            and signed on with{' '}
            <Text as="span" fontWeight="bold">
              {connection}
            </Text>
            . Would you like to link this sign-in with that account?
          </Text>
          <Text color="gray.500" fontSize="sm">
            (You will not be able to link again after this)
          </Text>
        </Stack>
        <HStack spacing="4" justify="center">
          <Button variant="outline" onClick={onDenyLink}>
            Deny link
          </Button>
          <Button colorScheme="blue" onClick={onLink}>
            Link
          </Button>
        </HStack>
      </Stack>
    </Container>
  );
};
