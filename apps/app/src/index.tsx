import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './configs/theme';
import { App } from './App';
import '@photonhealth/elements';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>
);
