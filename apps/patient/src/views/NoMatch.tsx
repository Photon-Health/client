import { Center, Heading, Text, VStack, ChakraProvider } from '@chakra-ui/react';
import { MdSearch } from 'react-icons/md';
import { useText } from '../hooks/useText';
import theme from '../configs/theme';
import { patientAnalytics } from '../configs/analytics';

export const NoMatch = () => {
  const t = useText();
  patientAnalytics.page('/', 'No Page or Order Found');

  return (
    <ChakraProvider theme={theme()}>
      <Center h="100vh">
        <VStack>
          <MdSearch size="2em" />
          <Heading as="h4" size="md" textAlign="center">
            {t.noMatch}
          </Heading>
          <Text textAlign="center">{t.questionVerb}</Text>
        </VStack>
      </Center>
    </ChakraProvider>
  );
};
