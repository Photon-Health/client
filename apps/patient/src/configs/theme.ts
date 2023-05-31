import { extendTheme } from '@chakra-ui/react';
import tinycolor from 'tinycolor2';
import { getSettings } from '@client/settings';

const settings = getSettings(process.env.REACT_APP_ENV_NAME);

function generateChakraTheme(key = undefined) {
  const { accentColor } = key in settings ? settings[key] : settings.default;

  const color = tinycolor(accentColor);
  const textColor = color.isLight() ? 'gray.800' : 'white';
  const brandLinkColor = color.isLight() ? color.clone().darken(10).toHexString() : accentColor;

  const colors = {
    brand: {
      50: color.clone().lighten(55).toHexString(),
      100: color.clone().lighten(50).toHexString(),
      200: color.clone().lighten(40).toHexString(),
      300: color.clone().lighten(30).toHexString(),
      400: color.clone().lighten(20).toHexString(),
      500: color.clone().lighten(10).toHexString(),
      600: accentColor,
      700: color.clone().darken(10).toHexString(),
      800: color.clone().darken(20).toHexString(),
      900: color.clone().darken(30).toHexString()
    },
    brandLink: brandLinkColor
  };

  const disabledStyles = {
    opacity: 0.4,
    cursor: 'not-allowed',
    boxShadow: 'none',
    bg: 'brand.300',
    color: 'gray.900'
  };

  const overrides = {
    colors,
    styles: {
      global: () => ({
        body: {
          bg: 'gray.50',
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
              bg: 'brand.700'
            },
            _disabled: disabledStyles
          })
        }
      }
    }
  };

  return extendTheme(overrides);
}

const theme = generateChakraTheme;

export default theme;
