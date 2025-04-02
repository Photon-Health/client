// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createThemes } = require('tw-colors');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    createThemes({
      photon: {
        primaryText: colors.gray[50],
        primary500: colors.indigo[500],
        primary600: colors.indigo[600],
        secondaryText: colors.gray[900],
        secondary50: colors.indigo[50],
        secondary100: colors.indigo[100]
      },
      weekend: {
        primaryText: colors.gray[50],
        primary500: colors.sky[500],
        primary600: colors.sky[600],
        secondaryText: colors.gray[900],
        secondary50: colors.sky[50],
        secondary100: colors.sky[100]
      }
    })
  ]
};
