import { Container, Heading, Stack, useBreakpointValue } from '@chakra-ui/react';

export const Disallowed = () => {
  return (
    <Container py={{ base: '12', md: '24' }}>
      <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
        <Heading size={useBreakpointValue({ base: 'xs', md: 'sm' })}>
          Your Organization has disallowed the use of our Web Application
        </Heading>
        <span>
          You can now safely close this tab and return to your organization's provided App or
          interface with Photon
        </span>
        <span>If you can't find this, please contact your administrator.</span>
      </Stack>
    </Container>
  );
};
