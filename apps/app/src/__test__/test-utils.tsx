import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ChakraProvider, theme } from '@chakra-ui/react';

function AllProviders({ children = [] }: { children?: ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}

const customRender = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options });

export { customRender as render };
