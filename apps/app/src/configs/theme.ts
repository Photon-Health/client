import { extendTheme, theme as baseTheme } from '@chakra-ui/react';
import { theme } from '@chakra-ui/pro-theme';
import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools';

const navy = {
  50: '#f5f7fb',
  100: '#e6ecf7',
  200: '#c3d2ec',
  300: '#96aad9',
  400: '#647fbe',
  500: '#3b579d',
  600: '#20387a',
  700: '#10285c',
  800: '#061a41',
  900: '#001740',
  950: '#000d22'
};

const blue = {
  25: '#EFF8FF',
  50: '#D1E9FF',
  100: '#B2DDFF',
  200: '#84CAFF',
  300: '#53B1FD',
  400: '#2E90FA',
  500: '#1570EF',
  600: '#175CD3',
  700: '#1849A9',
  800: '#194185',
  900: '#102A56',
  950: '#102A56'
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
      brand: blue,
      blue,
      navy
    },
    components: {
      Input: {
        variants: {
          outline: (props: StyleFunctionProps) => ({
            field: {
              _readOnly: {
                bg: mode('gray.100', 'whiteAlpha.100')(props),
                borderColor: mode('gray.200', 'whiteAlpha.300')(props),
                cursor: 'not-allowed',
                opacity: 0.8,
                pointerEvents: 'none',
                _hover: {
                  borderColor: mode('gray.200', 'whiteAlpha.300')(props)
                },
                _focus: {
                  borderColor: mode('gray.200', 'whiteAlpha.300')(props)
                }
              }
            }
          })
        }
      },
      Alert: {
        baseStyle: {
          container: {
            borderRadius: 'lg'
          }
        }
      }
    }
  },
  theme
);
export default customTheme;
