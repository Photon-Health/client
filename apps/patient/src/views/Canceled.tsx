import { Center, Heading, Text, VStack } from '@chakra-ui/react';
import { MdOutlineCancel } from 'react-icons/md';
import { text as t } from '../utils/text';

export const Canceled = () => {
  return (
    <Center h="100vh">
      <VStack>
        <MdOutlineCancel size="2em" />
        <Heading as="h4" size="md" textAlign="center">
          {t.canceled.heading}
        </Heading>
        <Text textAlign="center">{t.canceled.subheading}</Text>
      </VStack>
    </Center>
  );
};
