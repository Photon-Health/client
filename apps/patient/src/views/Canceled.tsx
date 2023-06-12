import { Center, Text, VStack } from '@chakra-ui/react';
import { MdOutlineCancel } from 'react-icons/md';
import t from '../utils/text.json';

export const Canceled = () => {
  return (
    <Center h="100vh">
      <VStack>
        <MdOutlineCancel size="2em" />
        <Text>{t.canceled}</Text>
      </VStack>
    </Center>
  );
};
