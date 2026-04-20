import { Container, Heading, Stack, useBreakpointValue } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

export const Disallowed = () => {
  const params = useParams();
  const action = params.action;
  return (
    <Container py={{ base: '12', md: '24' }}>
      <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
        <Heading size={useBreakpointValue({ base: 'xs', md: 'sm' })}>
          Sorry, your Organization has disallowed the {action} action on our Web Application
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
