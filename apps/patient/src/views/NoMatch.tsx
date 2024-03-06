import { Center, Heading, Text, VStack, ChakraProvider, Link } from '@chakra-ui/react';
import { MdSearch } from 'react-icons/md';
import { text as t } from '../utils/text';
import theme from '../configs/theme';

export const NoMatch = () => {
  const cleanedPhoneNumber = t.questionsPhoneNumber.replace(/[\s()-]/g, '');
  return (
    <ChakraProvider theme={theme()}>
      <Center h="100vh">
        <VStack>
          <MdSearch size="2em" />
          <Heading as="h4" size="md" textAlign="center">
            {t.noMatch}
          </Heading>
          <Text textAlign="center">
            {t.questionVerb}{' '}
            <Link href={`sms:${cleanedPhoneNumber}`}>{t.questionsPhoneNumber}</Link>.
          </Text>
        </VStack>
      </Center>
    </ChakraProvider>
  );
};
