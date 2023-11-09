import { extendTheme, theme as baseTheme } from '@chakra-ui/react';
import { theme } from '@chakra-ui/pro-theme';
import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools';

const customTheme = extendTheme(
  {
    styles: {
      global: (props: StyleFunctionProps) => ({
        body: {
          bgColor: mode('#F9FAFB', 'bg-canvas')(props)
        }
      })
    },
    colors: {
      ...baseTheme.colors,
      blue: baseTheme.colors.blue,
      brand: baseTheme.colors.blue
    }
  },
  theme
);
export default customTheme;
