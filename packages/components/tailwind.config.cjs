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
      },
      colors: {
        blue: {
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
        }
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
