import {
  Box,
  Divider,
  Heading,
  Text,
  Stack,
  Link,
  Card,
  CardBody,
  VStack,
  HStack
} from '@chakra-ui/react';
import { BsPersonFill } from 'react-icons/bs';
import { FaBook } from 'react-icons/fa';
import { HiTerminal } from 'react-icons/hi';

import { Page } from '../components/Page';

const resources = [
  {
    link: 'https://docs.photon.health/',
    icon: <HiTerminal />,
    text: 'API Reference'
  },
  {
    link: 'https://loom.com/share/folder/58b69f461099463da0b1fabb1ae340c3',
    icon: <FaBook />,
    text: 'Photon Product Guides'
  },
  {
    link: 'https://www.notion.so/Photon-Prescriber-Onboarding-519e2240816d400a87b0c27d2dc72fd8?pvs=4',
    icon: <BsPersonFill />,
    text: 'Prescriber Onboarding'
  }
];

export const Support = () => (
  <Page header="Support">
    <Card>
      <CardBody>
        <Stack alignItems="flex-start">
          <Box paddingBottom={2}>
            <Heading size="xxs">Contact Us</Heading>
            <Text>
              We’re here to help! Contact{' '}
              <Link color="teal.500" href="mailto:support@photon.health">
                support
              </Link>{' '}
              for any issues or feedback.
            </Text>
          </Box>
          <Divider />
          <Box>
            <Heading size="xxs">Helpful resources</Heading>
            <VStack align="start">
              {resources.map((resource) => (
                <Link color="teal.500" href={resource.link} key={resource.text}>
                  <HStack>
                    {resource.icon}
                    <Text>{resource.text}</Text>
                  </HStack>
                </Link>
              ))}
            </VStack>
          </Box>
        </Stack>
      </CardBody>
    </Card>
  </Page>
);
