import { Text, Flex, Box, HStack, Button, ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import { confirmable, createConfirmation } from 'react-confirm';
import theme from '../../configs/theme';

type GuardDialogProps = {
  show: boolean;
  proceed: Function;
  confirmation: string;
  options: {
    description?: string | React.ReactNode;
    darkMode?: boolean;
    cancelText?: string;
    confirmText?: string;
    colorScheme?: string;
  };
};

const GuardDialog = ({ show, proceed, confirmation, options }: GuardDialogProps) => {
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
        backgroundColor="rgba(0, 0, 0, 0.4)"
      >
        <Box
          background={options.darkMode ? 'gray.700' : 'white'}
          rounded="md"
          px={{ base: 4, md: 6 }}
          py={{ base: 4, md: 6 }}
          maxW={{ base: '90%', md: '600px' }}
          mx="auto"
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
