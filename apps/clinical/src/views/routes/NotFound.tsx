import { Container, Heading, Link, Stack, useBreakpointValue } from '@chakra-ui/react';

export const NotFound = () => (
  <Container maxW="md" py={{ base: '12', md: '24' }}>
    <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
      <Heading size={useBreakpointValue({ base: 'xs', md: 'sm' })}>
        Sorry, that page doesnt exist.
      </Heading>
      <Link color="teal.500" href="/">
        Go Home
      </Link>
    </Stack>
  </Container>
);
