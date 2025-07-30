import { Center, Heading, Text, VStack, ChakraProvider } from '@chakra-ui/react';
import { MdSearch } from 'react-icons/md';
import { text as t, PhoneLink } from '../utils/text';
import theme from '../configs/theme';
import { patientAnalytics } from '../configs/analytics';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const NoMatch = () => {
  const location = useLocation();
  useEffect(() => {
    patientAnalytics.page(location.pathname, 'No Page or Order Found');
  }, [location.pathname]);

  return (
    <ChakraProvider theme={theme()}>
      <Center h="100vh">
        <VStack>
          <MdSearch size="2em" />
          <Heading as="h4" size="md" textAlign="center">
            {t.noMatch}
          </Heading>
          <Text textAlign="center">
            {t.questionVerb}
            <PhoneLink />
          </Text>
        </VStack>
      </Center>
    </ChakraProvider>
  );
};
