import { ChakraProvider } from '@chakra-ui/react';
import { ScrollRestoration } from 'react-router-dom';

export function InfoPage() {
  return (
    <ChakraProvider>
      <ScrollRestoration />
      <h1>Info</h1>
    </ChakraProvider>
  );
}
