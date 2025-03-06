import { extendTheme } from '@chakra-ui/react';
import tinycolor from 'tinycolor2';
import { getSettings } from '@client/settings';

function generateChakraTheme(key?: string) {
  const { accentColor } = getSettings(key);

  const color = tinycolor(accentColor);
  const textColor = color.isLight() ? 'gray.800' : 'white';
  const linkColor = '#4299e1'; // Chakra blue.400

  const colors = {
    brand: {
      50: color.clone().lighten(45).toHexString(),
      100: color.clone().lighten(40).toHexString(),
      200: color.clone().lighten(30).toHexString(),
      300: color.clone().lighten(20).toHexString(),
      400: color.clone().lighten(10).toHexString(),
      500: accentColor,
      600: color.clone().darken(10).toHexString(),
      700: color.clone().darken(20).toHexString(),
      800: color.clone().darken(30).toHexString(),
      900: color.clone().darken(40).toHexString()
    },
    link: linkColor
  };

  const disabledStyles = {
    opacity: 0.4,
    cursor: 'not-allowed',
    boxShadow: 'none',
    bg: 'brand.400',
    color: 'gray.900'
  };

  const overrides = {
    colors,
    styles: {
      global: () => ({
        body: {
          bg: 'gray.100',
          color: 'gray.800'
        }
      })
    },
    shadows: {
      sm: '0px 0px 1px rgba(48, 49, 51, 0.05),0px 2px 4px rgba(48, 49, 51, 0.1)'
    },
    components: {
      Button: {
        variants: {
          brand: () => ({
            color: textColor,
            bg: 'brand.500',
            _hover: {
              bg: 'brand.600',
              _disabled: disabledStyles
            },
            _active: {
              bg: 'brand.600'
            },
            _disabled: disabledStyles
          }),
          filter: () => ({
            bg: 'white',
            border: '1px',
            borderColor: 'gray.200',
            _active: {
              bg: 'blue.50',
              color: 'blue.500',
              border: '1px',
              borderColor: 'blue.500'
            },
            // Applies hover styling only to non-mobile widths
            '@media(hover: hover)': {
              _hover: {
                bg: 'blue.50',
                color: 'blue.500',
                border: '1px',
                borderColor: 'blue.500'
              }
            }
          }),
          link: {
            color: 'blue.500',
            textUnderlineOffset: '0.1em',
            _hover: {
              color: 'blue.600',
              textDecoration: 'underline'
            },
            _active: {
              color: 'blue.700'
            }
          }
        }
      },
      Link: {
        baseStyle: {
          color: 'blue.500',
          fontWeight: 'semibold',
          textUnderlineOffset: '0.1em',
          _hover: {
            color: 'blue.600',
            textDecoration: 'underline'
          },
          _active: {
            color: 'blue.700'
          }
        }
      }
    }
  };

  return extendTheme(overrides);
}

const theme = generateChakraTheme;

export default theme;
