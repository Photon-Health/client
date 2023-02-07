import { Text, Flex, Box, HStack, Button, ChakraProvider } from '@chakra-ui/react';
import { confirmable, createConfirmation } from 'react-confirm';
import theme from '../../configs/theme';

const GuardDialog = ({
  show,
  proceed,
  confirmation,
  options
}: {
  show: boolean;
  proceed: Function;
  confirmation: string;
  options: Record<string, any>;
}) => {
  return (
    <ChakraProvider theme={theme}>
      <Flex
        hidden={!show}
        zIndex={10000}
        w="100vw"
        h="100vh"
        position="fixed"
        bottom={0}
        left={0}
        align="center"
        justify="center"
        backgroundColor="rgb(0, 0, 0, 0.4)"
      >
        <Box
          background={options.darkMode ? 'gray.700' : 'white'}
          rounded="md"
          px={4}
          py={4}
          minW="40%"
        >
          <Text align="left" fontWeight="semibold" fontSize="xl" pb={2}>
            {confirmation}
          </Text>
          <Text pb={4}>{options.description}</Text>
          <HStack justify="flex-end">
            <Button
              borderColor="blue.500"
              textColor="blue.500"
              colorScheme="blue"
              variant="outline"
              onClick={() => proceed(false)}
            >
              {options.cancelText || 'Cancel'}
            </Button>
            <Button colorScheme={options.colorScheme || 'brand'} onClick={() => proceed(true)}>
              {options.confirmText || 'Yes, Cancel'}
            </Button>
          </HStack>
        </Box>
      </Flex>
    </ChakraProvider>
  );
};

const confirm = createConfirmation(confirmable(GuardDialog));

export function confirmWrapper(confirmation: string, options: Record<string, any>) {
  return confirm({ confirmation, options });
}
