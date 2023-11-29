import { extendTheme, theme as baseTheme } from '@chakra-ui/react';
import { theme } from '@chakra-ui/pro-theme';
import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools';

const blue = {
  // tailwind
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554'
};

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
      blue,
      brand: blue,
      navy: '#273D52',
      slate: {
        // tailwind
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617'
      }
    }
  },
  theme
);
export default customTheme;
