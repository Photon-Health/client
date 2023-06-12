import { Center, Text, VStack } from '@chakra-ui/react';
import { MdSearch } from 'react-icons/md';
import t from '../utils/text.json';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../configs/theme';

export const NoMatch = () => {
  return (
    <ChakraProvider theme={theme()}>
      <Center h="100vh">
        <VStack>
          <MdSearch size="2em" />
          <Text>{t.noMatch}</Text>
        </VStack>
      </Center>
    </ChakraProvider>
  );
};
