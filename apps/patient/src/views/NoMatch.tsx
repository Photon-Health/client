import { Center, Heading, Text, VStack, ChakraProvider } from '@chakra-ui/react';
import { MdSearch } from 'react-icons/md';
import { text as t } from '../utils/text';
import theme from '../configs/theme';

export const NoMatch = () => {
  return (
    <ChakraProvider theme={theme()}>
      <Center h="100vh">
        <VStack>
          <MdSearch size="2em" />
          <Heading as="h4" size="md" textAlign="center">
            {t.noMatch.heading}
          </Heading>
          <Text textAlign="center">{t.noMatch.subheading}</Text>
        </VStack>
      </Center>
    </ChakraProvider>
  );
};
