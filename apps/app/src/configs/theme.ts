import { extendTheme } from '@chakra-ui/react'
import { theme } from '@chakra-ui/pro-theme'
import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools'

const customTheme = extendTheme(
  {
    styles: {
      global: (props: StyleFunctionProps) => ({
        body: {
          bg: mode('#f7f4f4', 'bg-canvas')(props)
        }
      })
    },
    colors: {
      ...theme.colors,
      blue: theme.colors.blue,
      brand: theme.colors.blue
    }
  },
  theme
)
export default customTheme
