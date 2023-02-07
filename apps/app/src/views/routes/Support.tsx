import { Box, Divider, Heading, Text, Stack, Link, HStack } from '@chakra-ui/react';
import { HiTerminal } from 'react-icons/hi';
import { Page } from '../components/Page';

export const Support = () => (
  <Page header="Support">
    <Stack alignItems="flex-start">
      <Box paddingBottom={2}>
        <Heading size="xxs">Were here to help</Heading>
        <Text>Have a specific issue?</Text>
        <Text>
          <Link color="teal.500" href="mailto:support@photon.health">
            Contact support
          </Link>
          &nbsp;or email us at support@photon.health
        </Text>
      </Box>
      <Divider />
      <Box>
        <Heading size="xxs">Helpful resources</Heading>
        <HStack>
          <HiTerminal />
          <Link color="teal.500" href="https://docs.photon.health/">
            API reference
          </Link>
        </HStack>
      </Box>
    </Stack>
  </Page>
);
